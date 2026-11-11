---
title: "Want to do AX but have nowhere to do it? Then head to open source"
description: "I started contributing to open source to get more experience building agents. How I pick repos, how I find bugs by running the code myself, and what it was like to be reviewed by a maintainer's AI bot."
summary: "Becoming an open source contributor from scratch"
pubDatetime: 2026-11-11T15:40:00+09:00
tags: [Open Source, AI, GitHub]
---

I wanted to do AX (AI Transformation). But I had nowhere to do it.

Agents had taken up a big slice of what I was studying. I wanted more hands-on experience with handling LLMs, and with separating the uncertain output of an LLM from the parts that have to be handled with certainty. But the work my organization needed didn't let me experience that.

So I wanted to widen my view, and talk and work with people doing that work in the places I wanted to be. That is how I naturally set out on the great voyage of open source.

Most AI projects are public on GitHub, and anyone can open an issue or a PR. Could there be a better environment??

So I acted on it the same day I thought of it, and so far I have opened 8 PRs across four repos. 4 were merged in two repos, and the other 4 in the other two repos are waiting for review.

| Repo                                                              | What                                            | PRs | Result  |
| ----------------------------------------------------------------- | ----------------------------------------------- | --- | ------- |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor)             | Multi-agent AI tutor                            | 2   | Merged  |
| [billion-context](https://github.com/ranxianglei/billion-context) | Context-compression plugin for AI coding agents | 2   | Merged  |
| [LangChain4j](https://github.com/langchain4j/langchain4j)         | Java LLM framework                              | 2   | Waiting |
| [Embabel](https://github.com/embabel/embabel-agent)               | JVM agent framework                             | 2   | Waiting |

This post focuses on the two repos where PRs were merged, and the path from zero to a merge.

## Pick repos by merge rate, not stars

The first criterion I thought of was famous repos. My reasoning was that a repo with lots of stars probably reflects the pain points and needs people feel best! But the more famous a repo is, the more often external PRs sit open for months, or aren't accepted at all. What I wanted was a place to talk with maintainers and other external contributors, and to discuss what I had in mind. That place only exists in repos where external PRs actually get read and merged. So I looked at merge rate first.

First, check whether the repo accepts external PRs at all. If the GitHub setting is collaborators-only, or CONTRIBUTING says "we don't accept external PRs," your PR gets closed even if the bug you found is real and measured. And some repos have the setting open but say no in their docs, so I checked both.

- External PR merge rate. 70% or more is good; under 40%, stay away
- Time to merge. Is the median under a week?
- Are long-abandoned external PRs piling up?
- Can I run the tests locally? Is a GPU or a paid API required? (No hardware, no money..)

When I picked DeepTutor, I analyzed 1,322 PRs and 780 issues. This is what came out.

- Open the issue and the PR together, within an hour. Post only the issue and someone else fixes it first.
- A `fix(scope): …` title, a regression test, 50–300 lines. Of first PRs that met these conditions, 86% were merged.

billion-context came by a different route. It is probably something a lot of people have struggled with, and I had really asked myself "how should I manage context?" too. Right then a repo tackling that same problem was in GitHub's trending top 10, so I added it to the candidates.

## Find bugs by running the code, not by reading issues

If you pick something to fix from the issue list, often someone is already on it, or it is a direction the maintainer doesn't want. So I ran things myself.

For DeepTutor, I installed v1.7.0 the day after its release and ran 11,601 backend tests plus the whole frontend check. Of the 3 failures on my Mac, 2 were real bugs. An environment the maintainer doesn't run every day is itself a chance to find bugs.

Now that agentic development has taken hold, I thought defects could be hiding behind the fast productivity. So I first set criteria for where to look, and had AI agents sweep the code with one lens per criterion. 31 candidates came out, and the verification agent judged all 31 to be "new, real bugs." A 100% confirmation should be doubted. From there I picked 7 that I could do well and wanted to try, and reproduced them myself to decide.

I kept fixes small, and always checked that the test failed before the fix and passed after it. That is because there was a case where an existing test helper was hiding the bug. A passing test didn't mean there was no bug.

## DeepTutor: merged in a day

On October 30 I opened two issues and two PRs.

- **[#2178](https://github.com/HKUDS/DeepTutor/pull/2178)**: When a translation key contained a colon (`:`), the screen showed a blank or garbled text. The translation library was reading the colon as a namespace separator. I fixed it with two lines of config and one test.
- **[#2185](https://github.com/HKUDS/DeepTutor/pull/2185)**: Looking up a missing knowledge base returned 500 instead of 404. It was a regression introduced in v1.7.0. I fixed 24 exception handlers and measured all 41 routes to confirm they behaved the same as just before the regression.

Both were merged the next day and went into v1.7.1. A contributor other than the maintainer left a review: they pulled the branch, ran the router tests themselves, and posted "149 passed." It struck me that there are people who actually run other people's PRs.

## billion-context: reviewed by the maintainer's AI bot

On November 9 I opened two issues and two PRs.

billion-context is a tool that sits between a coding agent and the AI model server and relays requests between them.

- **[#6006](https://github.com/ranxianglei/billion-context/pull/6006)**: When the model server keeps failing, billion-context blocks requests for a while. Then, after a short wait, it sends just one request as a trial to check whether the server has recovered (a half-open probe). The problem was that if that trial request got stuck with no response, the trial slot was never freed. Even after the server recovered, every request stayed blocked until the program was restarted. So I gave the trial slot an expiry. After a set time, the next request can try again.<br>Instead of waiting in real time, I verified it with a fake clock that can be fast-forwarded at will. I mixed request failures, successes, and the passage of time at random 360,000 times and fed the same sequence to the code before and after the fix. All 1,438 cases where the results differed were "blocked before the fix, allowed after."
- **[#6008](https://github.com/ranxianglei/billion-context/pull/6008)**: Even when the coding agent disconnected, the request billion-context had already sent to the model server wasn't cancelled and ran to the end. It was spending money on an answer nobody would receive.

In this repo the review wasn't done by a person but by an AI bot the maintainer runs. The bot searched open issues and PRs to check for duplicates, added labels, independently reproduced the cause, and judged it "mergeable." On #6008 it even read Node's source and attached measured evidence. Then the bot said "the branch is 3 commits behind, rebase it." When I rebased and replied, the bot verified the new commit again, confirmed all 30 CI checks passed, and left a note saying it was "ready for a human to merge."

\#6006 was merged 7 hours after I opened it, and #6008 the next day. As soon as each was merged, a build with that commit was published to npm.

## Contributing with AI

In both repos I investigated and fixed things with Claude Code. And I said so at the end of each PR.

> AI-assisted: I investigated and prepared this change with Claude Code, then reproduced and verified the results myself.

I didn't hand it to AI end to end; I worked by these rules.

- **Write only what was measured.** A bug I didn't reproduce, a number I didn't check, doesn't go in an issue.
- **I do the posting.** Commits, pushes, issues, and PRs are posted by me, not by AI. What I leave in someone else's repo carries my name.
- **I decide what to fix.** Even if an agent brings back 31 findings, I reproduce them and choose what to post.

AI can find bugs and fix code. But cutting a change to a size the maintainer will accept, matching the repo's conventions, and owning the result were still a person's job.

## Still waiting

The 4 PRs I opened in LangChain4j and Embabel are waiting for review. In LangChain4j a single maintainer handles review, and 45% of first PRs are still open. I picked it anyway. LangChain is a framework I actually use, and moving my own service to the 4j version may come up. So I looked for bugs while reading the code, as a PoC as well.

In Embabel, the maintainer asked me to "rewrite the explanation step by step with examples," so I rewrote the description. Merged or not, it made me look back at whether my explanation was easy for a maintainer to read.

## What I learned

1. **Pick by merge rate, not stars.** First check whether the repo accepts external PRs.
2. **Run it yourself instead of saying "do it for me."** A failure from a local run is a surer bug than the issue list. Aim for environments the maintainer rarely runs.
3. **Doubt a 100% confirmation.** If an agent says everything is real, reproduce it yourself.
4. **Write a test that fails before the fix.** A passing test may be hiding the bug.
5. **Match the repo's rhythm.** Title format, down to opening the issue and PR together.
6. **Disclose AI use, and own the result.** Write only what was measured, and post it yourself.

Some PRs are still waiting, and I plan to keep talking with external contributors and maintainers. It is fun, and the insight from those discussions is great.
