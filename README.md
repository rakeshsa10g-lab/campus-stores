# Campus Stores

## My submission: Open kits

**Short answer: yes, I would keep this product, with one change.** The desk is good at getting the right unit out of the door. It is weak at tracking a kit once it comes back in pieces. My change adds an **Open kits** view that keeps each club's kit together from pickup to the last item back.

Run it the same way as the original (open `index.html`). The app now opens on **Open kits**. Every original screen is still there.

### One moment the product handles well

At 3:45 pm I tried to issue PR-06 for the Film Society projector. The app did not offer it, because it is in the workshop. When I picked a unit type that was not on the approved form, it refused that too. The issue slip makes it hard to hand out the wrong thing, and the request note ("USB-C-only laptop") told me why the adapter mattered. I kept all of these checks.

### One moment I would change

At 7:30 pm Kabir brought back the projector and speaker and said Leela had the adapter. I closed two slips and wrote that in the desk book. On Saturday at 9 am, as the next shift, the register showed:

- `L-404 · AD-12`, issued to Kabir, due Fri 8 pm, with no item type and no sign that it was late
- `L-401 · MI-09`, Tara's microphone, which looked exactly the same

To work out that AD-12 was the adapter I had to open Inventory. To learn that Leela had it I had to read the desk book. There are two different adapters in bin C4 (AD-12 and AD-15). **Record return** closes a slip with one click, with no check that the item matches and no undo. The fact that the kit was incomplete was spread across three screens, and the one that mattered was free text.

### What I changed

1. **Open kits view.** One card per approved request, listing each approved item with the exact unit, who has it and whether it is back. The card says what is missing ("USB-C → HDMI adapter still out"), not just a count.
2. **Issue the kit in one step.** The approved items are already filled in. You pick the exact unit for each, and it still saves one slip per unit.
3. **"Someone else has it".** On a partial return you record who holds the item now and when it is expected. This is saved on the slip and copied into the desk book, so the next shift sees it where they look.
4. **Needs attention, built from the slips.** Every item that is overdue or left out of a partly returned kit is listed at the top, with the borrower, current holder, due time, why it needs attention and the next action. It is not a separate handover page, so it cannot drift from the records. On Saturday morning this list is the handover.
5. **Quick check-in by label.** Type or scan the unit ID of whatever is on the counter. The app finds its open slip by itself. If the ID is unknown or has no open slip (Leela hands over AD-15), it says so and **changes nothing**. Per-slip check-in asks for the label ID too.
6. **Who returned it, who received it, what state it is in.** Each return records the person handing it back, the desk shift that took it, and its condition. A damaged unit is accounted for but goes to the workshop, not back on the shelf.
7. **Desk metrics.** A small panel that counts the success measure described below, so the change can be judged on numbers.
8. **Undo that keeps history.** Undo reopens the slip and restores stock, and adds a correction line to the slip's history instead of deleting the return. Every slip has an append-only history: issued, holder changed, returned, corrected.

These follow six rules I held the build to: an item cannot be returned without being identified; a kit is complete only when every issued unit is back; a change of holder never overwrites the borrower; a returned item is not automatically available; one return updates the slip, the kit, stock and Needs attention together; and a correction never erases what happened.

The Loan register uses the same check-in and shows item types, holders and overdue flags.

### The same job with the change

- **Fri 3:45 pm.** Open kits → Courtyard screening → **Issue kit**. PR-04 is filled in as the only working projector. I picked SP-02 and AD-12, chose Kabir as instructed in the desk book, and kept Fri 8 pm. Three slips were saved in one go.
- **Fri 7:30 pm.** I checked in the projector (typed `PR-04`) and the speaker (`SP-02`). The card showed "USB-C → HDMI adapter still out". I clicked **Someone else has it** on the adapter: Leela Das, expected Sat 9 am.
- **Sat 9:00 am.** The new shift opens the app. **Needs attention** reads: "L-404 · AD-12 · USB-C → HDMI adapter · Film Society. Borrower Kabir Sen · holder Leela Das · due Fri 8 pm · expected Sat 9 am. Overdue since Fri 8 pm. Rest of the kit is back. Next: check it in when Leela Das arrives." Leela hands over an adapter and I type its label into **Quick check-in**. If it says AD-15, the app replies that AD-15 has no open slip and should be on the shelf in C4, and nothing changes. If it says AD-12, slip L-404 closes with "returned by Leela Das, received by Morning desk", stock updates and the card shows **All back**. If I closed the wrong one, **Undo check-in** reopens it and the history keeps both lines. Tara's microphone stays open, correctly, because it is not due until 10 am.

### What I kept, and why

One slip per physical unit, the repair and approval checks, the desk book, and the register. These work, and real desks rely on them. I changed how the slips are grouped and closed, not the record itself.

### Why this change and not others

Before choosing, I looked at how 17 lending products handle this: Cheqroom, WebCheckout, Shelf, Snipe-IT, Booqable, Rentman, Koha, Alma, Lend Engine and others. The full notes are in [`docs/research.md`](docs/research.md). In short:

- **Partial returns only stay visible when the loan has a container** (a booking or an order). Booqable shows a "Mixed" status and Shelf prints "Partial return · N still out". Snipe-IT treats each item on its own, and users have asked on GitHub since 2020 for a way to check a kit back in.
- **No product records "someone other than the borrower has this" on a short loan.** Libraries keep the borrower responsible and never record who actually returned it.
- **Scanning on return is optional almost everywhere,** undo is almost absent, and none has a shift handover feature.
- **From healthcare:** structured handover (I-PASS, NEJM 2014) cut medical errors by 23% without making handover longer. Scanning the item at the point of use cut medication errors by about 41% (Poon, NEJM 2010). Design guidance prefers undo to confirmation dialogs.

To choose between options I ranked failure modes by severity, how often they happen and how hard they are to spot (an FMEA-style score). Wrong unit checked in, a partial kit looking complete, and holder confused with borrower scored highest, so those came first. I left out fines, email reminders, a separate handover page and barcode hardware. Each is reasonable, but none is needed to fix Saturday morning, and the brief asks for one change.

### One observation at a real counter

**At the morning handover, can the incoming staff member close the right slip for an item from a partly returned kit without opening the desk book or Inventory, and without asking the previous shift?**

I would watch one week of morning shifts with the old flow and one week with Open kits. For each incomplete kit I would note whether they had to look elsewhere or ask someone, how long it took from the item arriving to the slip being closed, and whether the wrong slip was ever closed. If the change helps, the looking around and the calls to the previous shift should mostly disappear.

**The prototype measures this itself.** The bottom of Open kits has a **Desk metrics** panel. It counts slips that needed attention when a shift began and were closed during it, and how many of those were closed without the staff member opening Inventory or the Desk book. It also counts wrong or unknown IDs that were blocked and check-ins that were undone. An undone close is taken back out of the count, so the numbers cannot be inflated by mistakes. I added this last because a feature only counts once it moves a number. Of everything left, it was the cheapest way to make the success test something the desk can read off a screen instead of a claim in a README.

### Files changed

- `app.js`: Open kits view, kit issue, quick and per-slip check-in by label, holder logging, returned-by / received-by / condition, slip history, overdue and Needs attention, undo with correction history. Saved state moved to `campus-stores.shift.v2`.
- `styles.css`: kit cards, attention panel, quick check-in, inline forms, slip history, overdue tag, narrow layout.
- `index.html`: undo button in the status bar.
- `docs/research.md`: product and evidence audit behind the decision.

---

## About the original exercise

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
