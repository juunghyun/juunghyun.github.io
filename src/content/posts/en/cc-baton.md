---
title: "Running two Claude accounts with less friction"
description: "cc-baton is a CLI that moves a conversation between two Claude accounts as the original transcript, not a summary. The choices I made building it, the places it failed, and how unfinished it still is."
summary: "Choices and failures from building a tool that moves a whole conversation, not a summary"
pubDatetime: 2026-11-10T20:05:00+09:00
tags: [Claude Code, CLI, Python, Go]
---

I use two Claude accounts. I pay for both. Money melts twice as fast😎 💸

The two accounts have different limits, so I split my work between them. The problem was that work never ends at the size you first expected.  
The moment you switch accounts, the conversation stays in the account it started in. On the other account I had to hand it off somehow.

A summary is a loss. Why I dropped an approach, which files I had already read, what I was aiming for: all of that falls out. When you work with an agent, that context is the state of the work. So I built a small CLI that moves the whole conversation, [cc-baton](https://github.com/juunghyun/cc-baton).

This post is a record of the choices I made building it, the places it failed, and the unfinished state it is in now.

## What it does

- Type `/swap <account>` and press Ctrl+D, and the same conversation continues on that account, word for word. An account is named by its number, alias, or email.
- The account you are on is always shown under the prompt. The most dangerous thing was working without knowing which account the conversation was on.

## A conversation was one file

Looking inside Claude Code, a conversation turned out to be a single file: `<config dir>/projects/<working dir>/<conversation ID>.jsonl`. Each account has its own config dir (`CLAUDE_CONFIG_DIR`), and `claude --resume <conversation ID>` reopens that conversation.

So moving it comes down to one copy!

Copy that file, and the tool-output folder kept next to it, into the same place under the other account's folder, then `--resume` on that account. Existing tools offered either "all accounts share history" or "fully isolated." What I wanted was in between: move just this one session.

I didn't change a line of Claude Code. Environment variables, `--resume`, hooks, files left on disk. I only used what was already there.

## Copy after it exits!

You can't copy at the moment `/swap` is typed. The transcript file doesn't have the last turn written yet.  
So I split the request from the execution by one turn.

```text
/swap <account>  → only leaves a request file saying "next, this account"
Ctrl+D           → Claude Code exits and the conversation is written to the end
baton loop       → reads the request file, copies, then --resume on that account
```

The request file is a small JSON file that only says which account to go to next. `baton` is a zsh function wrapped around Claude Code, and inside it is a single while loop. However many things write a request file (a `/swap` you typed, a hook that fires when you hit a limit), execution always happens in this one place. I added a "sleep" request to the same loop, so a tab left idle is shut down and reopened with one key. Measured on this Mac just now, a tab with a live conversation uses 260–530MB, and a tab in sleep mode uses 3–6MB.

I don't trust the request file even though I wrote it. Paths are recomputed, the conversation ID format is checked, and a request older than an hour is thrown away.

## It didn't work at the moment I needed it most😭

At first it was a slash command. Then I typed `/swap` in a conversation that had hit its limit, and only then found out. It doesn't work. Obvious in hindsight. The surest moment you want to switch accounts is when you hit the limit, and a slash command is, in the end, a request sent to the model. On an account at its limit, that request dies with a 429. The feature didn't work at the moment it was needed most.

So I moved it to a `UserPromptSubmit` hook, which runs before the prompt goes to the model. If the input is `/swap …`, the hook writes the request file and blocks the prompt. The result is zero model calls.

I needed it the very night I moved it. A little after midnight I hit the limit, and three minutes later a `/swap` typed in the same conversation was caught by the hook and handed over to the other account.

## I deliberately left out Claude ↔ Codex handoff

I thought about handing a Claude conversation over to Codex too. But Codex can't pick up Claude's conversation file. (The schemas differ. It is also worth knowing that the two behave somewhat differently.) So a perfect handoff is impossible, and the only option was pasting the transcript in as text. That isn't what this tool is for, which is continuing the same conversation as it is. So? I took it out of baton's scope entirely.

## The user might be an agent

When I opened up a script I had been using alone, the first thing I thought about was installation. These days people often hand a repo URL to an AI agent and say "install this." So when the installer asks a question, it is often an agent, not a person, who receives it.

So installation asks nothing, and gives the same result however many times you run it. Things a person has to choose (account groups, sleep, auto-swap, permission prompts) are asked when a person first runs `baton`. The README has a separate note addressed to agents.

```text
Installing with an AI agent?

Run exactly the two lines above. Don't edit ~/.claude/settings.json or ~/.zshrc yourself.
Show the user what `cc-baton install` printed and tell them to open a new terminal
and run `baton` to finish setup.
```

## My defaults aren't other people's defaults

Right before release I ran adversarial reviews split by angle: terms, security, usability, QA. The one that stung most was that the first version always launched Claude Code with `--dangerously-skip-permissions`, the option that lets the agent run commands without asking. I had been using it that way for so long that I had more or less forgotten it was a choice.

Something I turned on for my own convenience runs by default on someone else's Mac the moment it is public. It is worse when it is a permission handed to an agent. So I turned every feature default off and let users choose what to turn on.

The same review raised a similar point: the HUD could run a command planted in another repository's `.git/config` every 10 seconds. I would never have seen these myself.

## A bug in the tool I lean on is my bug

I left account login to [claude-swap](https://github.com/realiti4/claude-swap). I didn't want to handle account login myself. And after release, that tool's behavior burned me badly, twice.

### One number sat frozen for six days

Watching the HUD, I noticed that only one account's usage wasn't updating. The other account on the same HUD was fine. So I narrowed the scope to that account's state rather than the display code.

The display was a problem too. Among the chips at the end of the row, "9140m ago" was hard to read; it turned out not to mean that the last value alone was old, but that the whole row was a reading received six days earlier. The numbers were frozen, and the screen showed them as if they were current. So I moved "how old this reading is" to the front of the row.

The cause was claude-swap's quarantine. It had put that account in the "needs re-login" group, but the actual login was fine. A conversation running on that account was still working. What had expired was only the copy of the login that claude-swap kept separately(!!). While Claude Code inside the conversation rotated the token, the copy became a past generation, and the check looked only at the copy.

I didn't do what the tool told me to. claude-swap tells you to register the account again. But doing that while a conversation is running can let the stale copy overwrite the live login on the next run and log you out. I only cleared the quarantine mark, and for the real fix bundled a newer version that fixes the problem.

### An account folder was wiped whole

In late October, one account was suddenly logged out. Before launching an account, claude-swap checks that account's folder, and if the check fails it deletes the whole folder. That folder holds every conversation of that account, including one just moved in with `/swap`. A tool that moves conversations was standing on a structure that could delete them.

It wasn't only notes that were gone. Every conversation record on that account disappeared. No backup, no snapshot, nothing in the trash. The one survivor was a conversation that was running at the time, because its process was holding the conversation in memory. A few notes were restored from it, since their text was still in that conversation.

Sadly, I ran into that problem again while writing this post. I went looking for what I was thinking the day I moved to a hook, and why I chose Go, and those conversations weren't there. What remained were commit messages, a plan document, and the hook log. Every "why" above comes from those.

Two things were fixed.

1. When baton launches an account, it wraps the cleanup so the conversations folder is kept, and
2. I bundled a claude-swap version that fixes the quarantine problem.

## Choosing Go

It was mid-October when I decided to stop leaning on claude-swap and carry that dependency myself. That was before the two incidents above. The incidents only confirmed the decision. Rewriting the account-handling part in my own code, I started by choosing the language again. Those conversations are gone, so I measured again to confirm the reasons.

baton is called more often than you would think. The status line runs every 10 seconds for each open conversation, and the hook runs on every prompt. Each time, a new process starts. So what matters isn't processing speed but the time it takes to start.

| What ran                                 | Time |
| ---------------------------------------- | ---- |
| Reading the account list, ported to Go   | 6ms  |
| Reading the account list, current Python | 80ms |
| A program that does nothing, Go          | 4ms  |
| Same, Swift                              | 3ms  |
| Same, Python                             | 16ms |
| Same, Node                               | 22ms |

Medians of 30 runs each on the same Mac. The account list was read in an empty state with no accounts, so as not to touch my real ones. Go finishes the same job 13 times faster. Python takes 16ms just to start the interpreter, and 80ms once modules are loaded. With five conversations open, the status line alone runs over 40,000 times a day.

I haven't moved the status line itself yet. What is ported to Go so far is the account handling that claude-swap did; baton's own parts, like the status line and hooks, are still Python. Whether to port those too gets decided after this switch is done.

Installation changes too. Today you have to install uv and Python first. The Go build is one 10MB file. A build for Intel Macs comes out of the same place in 4 seconds. It uses no external libraries.

I weighed the other candidates as well.

- **Swift**: starts as fast as Go and is the most comfortable for the keychain. But it closes the road beyond macOS.
- **Node**: 22ms to start, and a runtime has to be installed alongside. The same problems as Python remain.
- **Rust**: I didn't measure it. Startup should be in Go's class. But this tool only reads files, handles JSON, and launches processes, so there is nowhere to gain more than that. Build time and learning time are longer.
- **Staying on Python**: fastest to change. But the startup time and installation problems stay.

So, Go. It starts fast, ships as one file, and the standard library covers everything it needs.

## Where baton is now

Since November I open Claude Code only through baton. Moving conversations, the account display, and sleep are things I use every day without thinking. The latest change keeps a session's workspace name from changing when a sleeping conversation is woken.

But it is still unfinished. Honestly:

- **It still stands on claude-swap.** The account features are all built in Go and passed every check that was safe to run. The goal is a one-line install with neither Python nor claude-swap.
- **But I can't make the switch.** The last check requires closing every tab of that account. And I can't close those tabs. Every session is a conversation with work in progress. Changing the tool means stopping the tool, and I can't stop it, so the switch is on hold until I find a way to check. (The sprint has also been really tight since then.)
- **The code I was porting was copying the bug too.** After the incident I saw that the Go side had faithfully ported the quarantine check. Had I switched as it was, the same quarantine would have happened again. I fixed the check on the Go side before any switch. A hole also turned up here: whether a conversation is alive was judged from record files alone. There really was a conversation that kept working with its records deleted. That must not happen...
- **It leans on things that aren't official APIs.** The feature that keeps a conversation's name uses an environment variable that isn't in `claude --help`. Every time Claude Code updates, I have to check that it still works.

It still has 0 GitHub stars. For now it is a tool only I use every day 🥹

## What I learned

1. **Context is the state of the work.** If the original is already on disk, move it instead of summarizing it. Conversation transfer looked like a big feature and turned out to be one file copy and one `--resume`.
2. **Put the emergency exit in front of the model.** A path that asks the model gets blocked when the model is blocked!
3. **Assume the user may be an agent.** Installation asks nothing; what a person has to choose is asked where a person will see it.
4. **Don't hand your defaults to others.** An option you turned on for yourself runs on other people's computers the moment you publish. Permissions given to an agent stay off by default.
5. **A bug in the tool you lean on is your bug.** If you stand on an unofficial structure, your users are the ones who lose data when that structure is wrong. Port it as it is and you port the bug too. If you don't want to bear that dependency, carry it yourself.
6. **Compare with the healthy side first, and doubt the tool's own prescription.** If only one account is off, the scope is that account. Had I re-registered as instructed, I would nearly have lost a healthy login too.
7. **Leave the reasons in commits and documents, not in conversations.** The conversations were deleted; the commit messages and the plan document survived. You only look back at what you wrote down.

## Before you use it

- **Your own accounts only.** Sharing an account isn't allowed under Anthropic's terms.
- **Obviously, limits don't grow.** It only changes which of your accounts is used.

The code is at [github.com/juunghyun/cc-baton](https://github.com/juunghyun/cc-baton). (Stars are very welcome)

Money still melts twice as fast. But I only explain things once✌️

Next post: Want to work on AX (AI transformation) but have nowhere to do it? Then head to open source (becoming a contributor from scratch)
