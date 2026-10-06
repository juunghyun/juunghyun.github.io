---
title: '"The formats are all over the place, just build me a perfect Excel parser": how I handled it'
description: "Pulling data out of Excel files with no fixed format: how I split work between the LLM and code, and what I learned about memory, value fidelity, and schemas."
pubDatetime: 2026-10-06T15:36:02+09:00
tags: [LLM, Python, Excel, Kafka]
---

> "Shouldn't we have some AI in our product too?"

I'm still not sure it made sense to talk about "AI transformation" for a feature that already worked fine, deterministically. But that's how I ended up with the job: pull measurement data out of Excel files.

## Spreadsheets with no template

The files I had to work with were Excel workbooks full of sensor readings. Until then, using this data meant someone had to copy the values into a fixed template by hand.

What I wanted was to get rid of that copying step. Whatever shape a file came in, I had to be able to pull out the data that mattered. The catch: these files have no fixed format. Every author has their own name for the same sensor, and every new file brings a layout I've never seen before.

## Just throw it at the model

I started simple.

- **Attempt 1**: Hand over the whole workbook and ask, "Extract only the meaningful data." It showed some promise.
- **Attempt 2**: "Tell me which sensor type this sheet is." Also somewhat promising.

But at the pace of testing one requirement at a time, there was no way to finish within the sprint. So I stepped back and rethought the approach.

## How do people actually handle these files?

I changed the question. Instead of "what should the LLM do?", I asked "how does a person do this by hand?" The manual workflow looked like this:

1. Open a blank copy of the template.
2. Copy only the measurement data out of the original workbook and paste it into the template for that sensor type.
3. Rename the sheet to the sensor's name. In the originals, that name could be anywhere: the sheet name, the file name, a title at the top of the sheet, or next to the install location.
4. Check the units.
5. Only consider data inside the print area.

Then I sorted each step by a single question: **can this step be decided by a rule, or does a person have to look at it and judge?**

- Steps that need human judgment → delegate to the LLM.
- Steps that follow fixed rules → handle in code.

With that framing in place, I started over, and the architecture fell out of it. The LLM only produces a layout plan: which cells are dates, which columns hold values, which sensor a block belongs to. Code then follows those coordinates and reads the actual numbers straight from the cells. If the model can't produce a plan for a sheet, it falls back to a free-form path where the LLM transcribes the values itself. That fallback comes back to bite me later.

## What does the model need to see?

Once the framing was set, the next questions followed. Where exactly does human judgment come in? What data does that judgment depend on? What's an efficient way to hand that data to the LLM? Can intermediate results be thrown away, or should they be cached?

Answering all of that up front would have taken forever. So I aimed for an end-to-end MVP first. Most of the real problems showed up once it was actually running.

## One large spreadsheet kept killing the process

During testing, processing a large workbook caused `/health` to time out and the Kafka heartbeat to stall. The pod kept restarting until it landed in CrashLoopBackOff, and every restart re-consumed messages that had never been committed.

Tracing the restarts led me to the event loop. Excel parsing is synchronous, CPU-bound work, and it was holding the asyncio event loop hostage. aiokafka's heartbeat is a task on that same loop, so when the loop blocks, the heartbeat stops too. If you see health-check timeouts, a stalled heartbeat, and re-consumption all at the same time, suspect a blocked event loop first.

The Kafka consumer needed work too; nothing handled re-consumption.

- Moved the heavy parsing and verification stages to `asyncio.to_thread`.
- Isolated exceptions inside the consume loop. There was a zombie state where a single commit error after a rebalance stopped consumption for good, while health checks kept reporting healthy.
- Added a poison-message guard. Before processing, record the attempt count for each message in durable storage, and send it to a DLT once it passes a limit. A message that OOM-kills the process never gets a chance to raise an exception, so the record has to be written _before_ processing starts.

## What does "reading" an Excel file even mean?

Before looking at memory, I had to answer a more basic question: what's a good way to read Excel? And what does "read" actually mean here?

For this pipeline, reading meant more than pulling cell values. It meant layout too: which cells are merged and where the print area ends. That's exactly what people were looking at in steps 3 to 5 of their workflow. It's also why I picked openpyxl in the first place. It supports merged cells, print areas, and random cell access, and by then the code leaned on those features all over the place.

## Leak, or high-water mark?

RSS instrumentation showed a single workbook with a few dozen sheets using close to a gigabyte of memory. My first guess was a leak, but it wasn't. It was the high-water mark from openpyxl's default mode loading the entire workbook into objects. A leak grows with every job; this stayed flat under sequential processing and only multiplied with concurrency. As a stopgap, I lowered concurrency and went looking for a real fix.

I built a synthetic file (4.3 MB, 52 sheets, 620k cells) and benchmarked three options on it:

| Parser                         | Peak RSS     | Merged cells     | Print area | Random cell access        |
| ------------------------------ | ------------ | ---------------- | ---------- | ------------------------- |
| openpyxl default mode (before) | 277 MB       | Yes              | Yes        | Yes                       |
| openpyxl `read_only`           | 43 MB (−85%) | No               | No         | Works, but extremely slow |
| calamine                       | 22 MB (−92%) | No (at the time) | No         | No                        |

I went with `read_only`. It captures most of the savings on its own. Saving another 21 MB with calamine would have meant giving up print areas and random access, and rewriting the `.xls` path as well.

To get back the merged-cell and print-area information that `read_only` drops, I parse the XML inside the `.xlsx` file (it's a zip) directly with `zipfile` and `iterparse`, without loading any cell values. One trap: in `read_only` mode, every `ws.cell(r, c)` call re-streams the sheet from the beginning. In a 400×30 nested loop, `iter_rows` took 20 ms; `cell()` took 110 seconds.

In the end, peak memory on large workbooks dropped to roughly a quarter of what it had been.

## Values must match the source exactly

With memory under control, a more fundamental question remained: are the values we output actually the same as the ones in the spreadsheet?

The policy was simple. **Output values must equal the values stored in the Excel file.** Not the rounded value you see on screen; the value stored in the cell. I audited the whole pipeline against that rule. The paths where code reads cells directly were fine. The problem was the free-form path where the LLM transcribes values. It had zero checks against the source. If 9.1992 became 9.192, say, it could pass silently as long as it was within the normal range.

The case that stuck with me involved dates. Some workbooks store dates as plain serial integers (e.g. 45000) with no date format applied. The LLM on the free-form path was converting these to dates by itself, and the same number came back a day late on one call and a day early on another. The measurement values were all correct, so nobody suspected anything.

The fix: code detects serial-date columns and converts them to ISO dates before anything reaches the LLM. The LLM never does the arithmetic. After the fix, repeated runs against the real model returned the same date every time.

I added one more safeguard. Every number the LLM outputs is checked for an exact match against the set of numeric cells in the source sheet, and anything that couldn't have come from any cell raises a warning. Across all the sample files I had, it produced no false positives.

But the date-detection rule had its own trap. A reviewer ran it against every sample file and found that a measurement that wasn't a date at all had been converted into one. It just happened to be an integer in the same range as date serials. Every condition in the detector looked only at the _shape_ of the number. The file I'd designed it around happened to be an unlabeled grid, and I had generalized "this must work without labels" into a rule for every file.

## The schema decides what the LLM generates

Around the same time, I noticed something odd. One field that no code ever read was still marked required in the output schema, and the LLM filled it in fairly often. The prompt never mentioned it. Making the field optional didn't help either: as long as the key exists in the schema, the model fills it.

I ended up removing it in three steps: make it optional, delete the related sentences from the prompts and deploy that to every environment, then drop the field from the schema entirely.

## The harness

LLM-backed code is scary to change. In this pipeline, a sizable share of bug fixes turned out to be regressions caused by earlier fixes colliding with each other.

So I built a replay stub that captures LLM responses and plays them back. When the same request comes in, it returns the captured response, and everything else runs through the production code path unchanged. Because the LLM output is pinned, the bar for passing is an exact match: if a single character of output changes, behavior changed. The full sample set runs in about ten seconds without a single LLM call. Only with this gate in place could I start the refactor that slimmed down the bloated functions.

## What I learned

1. **Don't let the LLM do arithmetic or conversions.** Date conversion, unit conversion, and deduplication are cheaper and more accurate in deterministic code. Getting the same answer every time is a bonus.
2. **If the LLM transcribes values anywhere, check them against the source.** Range checks won't catch transcription errors.
3. **It's the schema, not the prompt, that drives what the LLM generates.** An unused field only goes away when you remove it from the schema. Keep your schema current.
4. **Run the entire corpus before you turn an observation into a rule.** What holds in your sample isn't guaranteed to hold everywhere.
5. **For memory problems, first figure out whether it's a leak or a high-water mark.** The fix depends entirely on the answer.

I'm still not sure we needed AI here. But I came away with one test for what to hand to the LLM and what to keep in code: did a person have to look at it and judge?

Next post: Running two Claude accounts with less friction (a.k.a. burning money faster).
