(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      short: "Fri 3:45 pm",
      desk: "Evening desk",
      now: 945,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      short: "Fri 7:30 pm",
      desk: "Evening desk",
      now: 1170,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      short: "Sat 9:00 am",
      desk: "Morning desk",
      now: 1980,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  // Minutes from Friday 00:00, so desk time and due times can be compared.
  const dueTimes = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  const dueMinute = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const pages = [
    ["Open kits", "package-open"],
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 2,
    tab: "Open kits",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        out: "Fri 3:30 pm",
        back: false,
        history: ["Fri 3:30 pm · Issued to Tara Shah, due Sat 10 am"],
      },
    ],
    notes: [],
    // Units checked in as damaged. They are accounted for but stay out of stock.
    damaged: [],
    quickError: "",
    editing: false,
    onlyOpen: true,
    // Inline form open on a kit or slip: {kind: "issue", req} or {kind: "checkin" | "custody", num}.
    form: null,
    formError: "",
    // Slip number of the last check-in, so a wrong click can be reversed.
    undo: 0,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const now = () => shifts[s.phase];
  const inRepair = (a) => a.repair || s.damaged.includes(a.id);
  // Append-only slip history. Corrections add a line; nothing is deleted.
  const log = (l, text) =>
    (l.history = l.history || []).push(now().short + " · " + text);
  const typeOf = (l) => getAsset(l.asset).type;
  const isLate = (l) => !l.back && now().now > dueMinute[l.due];
  const slipName = (l) => "L-" + l.num + " · " + l.asset + " · " + typeOf(l);
  // Latest slip for each approved item type on a request.
  const kitLines = (r) =>
    r.items.map((type) => ({
      type,
      loan: s.loans
        .filter((l) => l.req === r.id && typeOf(l) === type)
        .sort((a, b) => b.num - a.num)[0],
    }));
  const missingTypes = (r) =>
    kitLines(r)
      .filter((x) => !x.loan)
      .map((x) => x.type);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, sel = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === sel ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const pick = (label, name, options, sel = "", extra = "") =>
    "<label><span>" +
    esc(label) +
    '</span><select name="' +
    name +
    '" required' +
    extra +
    '><option value="">Select…</option>' +
    opts(options, sel) +
    "</select></label>";
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, kind = "") =>
    '<span class="tag ' + kind + '">' + esc(t) + "</span>";
  const formError = () =>
    s.formError
      ? '<p class="err" role="alert">' + esc(s.formError) + "</p>"
      : "";
  const formButtons = (label) =>
    '<div class="buttons"><button type="submit" class="primary">' +
    esc(label) +
    "</button>" +
    btn("Cancel", "cancel-form") +
    "</div>";
  const condPick = () =>
    '<label><span>Condition</span><select name="cond"><option value="ok">Working</option><option value="damaged">Damaged, send to workshop</option></select></label>';
  function whereabouts(l) {
    if (l.back)
      return (
        "Returned " +
        l.backAt +
        " by " +
        l.backBy +
        " · received by " +
        l.receivedBy +
        (l.damagedOnReturn ? " · damaged, sent to workshop" : "")
      );
    let t = "Out since " + l.out + " · with " + (l.holder || l.who);
    if (l.holder) t += " · expected " + l.expect + " (logged " + l.heldAt + ")";
    return t;
  }
  function loanActions(l) {
    if (l.back) return badge("Returned", "good");
    return (
      (isLate(l)
        ? badge("Overdue · was due " + l.due, "warn")
        : badge("Due " + l.due)) +
      (l.holder ? "" : btn("Someone else has it", "custody", String(l.num))) +
      btn("Check in", "checkin", String(l.num), "primary")
    );
  }
  // One slip row. Inside a kit card the item type leads; in the register the slip number does.
  function slipRow(l, inKit) {
    return (
      '<div class="row"><div><strong>' +
      esc(inKit ? typeOf(l) : slipName(l)) +
      "</strong><small>" +
      esc(
        inKit
          ? "L-" + l.num + " · " + l.asset + " · " + getAsset(l.asset).model
          : l.req + " · issued to " + l.who,
      ) +
      "</small><small>" +
      esc(whereabouts(l)) +
      "</small>" +
      (l.history && l.history.length
        ? "<details><summary>History (" +
          l.history.length +
          ")</summary><ul>" +
          l.history.map((h) => "<li>" + esc(h) + "</li>").join("") +
          "</ul></details>"
        : "") +
      '</div><div class="acts">' +
      loanActions(l) +
      "</div></div>" +
      loanForm(l)
    );
  }
  function loanForm(l) {
    const f = s.form;
    if (!f || f.num !== l.num) return "";
    const a = getAsset(l.asset);
    if (f.kind === "checkin")
      return (
        '<form class="inline" data-checkin data-num="' +
        l.num +
        '"><p><b>Check in ' +
        esc(a.type) +
        "</b><small>Type the unit ID from the label on the item at the counter. Slip L-" +
        l.num +
        " is for a " +
        esc(a.model) +
        '.</small></p><div class="form"><label><span>Unit ID on the label</span><input name="unit" required autocomplete="off" spellcheck="false" placeholder="e.g. PR-04" data-autofocus /></label>' +
        pick(
          "Handed back by",
          "by",
          people.map((p) => [p, p]),
          l.holder || l.who,
        ) +
        condPick() +
        "</div>" +
        formError() +
        formButtons("Confirm return") +
        "</form>"
      );
    return (
      '<form class="inline" data-custody data-num="' +
      l.num +
      '"><p><b>Who has the ' +
      esc(a.type) +
      " now?</b><small>Saved on slip L-" +
      l.num +
      ' and copied to the desk book for the next shift.</small></p><div class="form">' +
      pick(
        "Now with",
        "holder",
        people.map((p) => [p, p]),
        "",
        " data-autofocus",
      ) +
      pick(
        "Expected back",
        "expect",
        dueTimes.map((d) => [d, d]),
      ) +
      "</div>" +
      formError() +
      formButtons("Save on slip") +
      "</form>"
    );
  }
  function issueForm(r, missing) {
    return (
      '<form class="inline" data-kit data-req="' +
      r.id +
      '"><p><b>Issue kit for ' +
      esc(r.club) +
      "</b><small>One slip is saved per unit. Pick the exact unit you hand over.</small></p>" +
      '<div class="form">' +
      missing
        .map((t, i) => {
          const free = assets.filter(
            (a) => a.type === t && !inRepair(a) && !out(a.id),
          );
          return pick(
            t,
            "unit" + i,
            free.map((a) => [a.id, a.id + " · " + a.model + " · bin " + a.bin]),
            free.length === 1 ? free[0].id : "",
            i === 0 ? " data-autofocus" : "",
          );
        })
        .join("") +
      pick(
        "Collected by",
        "who",
        people.map((p) => [p, p]),
      ) +
      pick(
        "Return by",
        "due",
        dueTimes.map((d) => [d, d]),
        r.due,
      ) +
      "</div>" +
      formError() +
      formButtons(
        "Issue " + missing.length + " item" + (missing.length > 1 ? "s" : ""),
      ) +
      "</form>"
    );
  }
  function kitCard(r) {
    const lines = kitLines(r);
    const issued = lines.filter((x) => x.loan).length;
    const stillOut = lines.filter((x) => x.loan && !x.loan.back).length;
    const someBack = lines.some((x) => x.loan && x.loan.back);
    const state = !issued
      ? badge("Not issued")
      : !stillOut && issued === lines.length
        ? badge("All back", "good")
        : someBack && stillOut
          ? badge(
              lines
                .filter((x) => x.loan && !x.loan.back)
                .map((x) => x.type)
                .join(", ") + " still out",
              "warn",
            )
          : badge(stillOut + " of " + lines.length + " out");
    let html =
      '<section class="kit" aria-label="' +
      esc(r.event) +
      '"><div class="kithead"><div><h3>' +
      esc(r.event) +
      "</h3><small>" +
      esc(
        r.id + " · " + r.club + " · filed by " + r.owner + " · return by " + r.due,
      ) +
      "</small></div>" +
      state +
      "</div>";
    for (const x of lines)
      html += x.loan
        ? slipRow(x.loan, true)
        : row(x.type, "Approved, not issued yet", badge("Not issued"));
    const missing = missingTypes(r);
    if (s.form && s.form.kind === "issue" && s.form.req === r.id)
      html += issueForm(r, missing);
    else if (missing.length)
      html +=
        '<div class="buttons">' +
        btn(
          missing.length === lines.length ? "Issue kit" : "Issue remaining items",
          "issue",
          r.id,
          "primary",
        ) +
        "</div>";
    return html + "</section>";
  }
  function kitsPage() {
    let html = head(
      "Open kits",
      "One card per approved request · what left the desk, who has it, what is still out",
    );
    const flagged = s.loans.filter(
      (l) =>
        !l.back &&
        (isLate(l) || s.loans.some((o) => o.req === l.req && o.back)),
    );
    if (flagged.length)
      html +=
        '<div class="attention"><b>Needs attention</b>' +
        flagged
          .map(
            (l) =>
              "<p><b>" +
              esc(slipName(l)) +
              "</b> · " +
              esc(getReq(l.req).club) +
              "<br>" +
              esc(
                "Borrower " +
                  l.who +
                  " · holder " +
                  (l.holder || l.who + " (not confirmed)") +
                  " · due " +
                  l.due +
                  (l.holder ? " · expected " + l.expect : ""),
              ) +
              "<br><small>" +
              esc(
                (isLate(l) ? "Overdue since " + l.due + ". " : "") +
                  (s.loans.some((o) => o.req === l.req && o.back)
                    ? "Rest of the kit is back. "
                    : "") +
                  "Next: " +
                  (l.holder
                    ? "check it in when " + l.holder + " arrives (type the label ID)."
                    : "ask " + l.who + " who has it and log it on the slip."),
              ) +
              "</small>" +
              "</p>",
          )
          .join("") +
        "</div>";
    html +=
      '<form class="inline quick" data-quick><p><b>Quick check-in</b><small>Type or scan the label ID of any item at the counter. The app finds its open slip. Unknown or unexpected IDs change nothing.</small></p><div class="form"><label><span>Unit ID on the label</span><input name="unit" required autocomplete="off" spellcheck="false" placeholder="e.g. AD-12" /></label><label><span>Handed back by</span><select name="by"><option value="">Holder on the slip</option>' +
      opts(people.map((p) => [p, p])) +
      "</select></label>" +
      condPick() +
      "</div>" +
      (s.quickError
        ? '<p class="err" role="alert">' + esc(s.quickError) + "</p>"
        : "") +
      '<div class="buttons"><button type="submit" class="primary">Check in</button></div></form>';
    return html + requests.map(kitCard).join("");
  }
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const loan = out(a.id);
      const status = inRepair(a) ? "In repair" : loan ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model +
          " · " +
          a.bin +
          (loan ? " · with " + (loan.holder || loan.who) : ""),
        badge(status, status === "On shelf" ? "good" : ""),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !inRepair(a) && !out(a.id));
      return (
        html +
        '<form data-issue><div class="form">' +
        pick(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        pick(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        pick(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        pick(
          "Return by",
          "due",
          dueTimes.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) html += slipRow(l, false);
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, n.by || "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    "Open kits": kitsPage,
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q('[data-action="undo"]').hidden = !s.undo;
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    const focus = q("[data-autofocus]");
    if (focus) focus.focus();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  const openForm = (form) => {
    s.form = form;
    s.formError = "";
  };
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.form = null;
        s.quickError = "";
        s.undo = 0;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.form = null;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "issue":
        openForm({ kind: "issue", req: v });
        break;
      case "checkin":
        openForm({ kind: "checkin", num: Number(v) });
        break;
      case "custody":
        openForm({ kind: "custody", num: Number(v) });
        break;
      case "cancel-form":
        openForm(null);
        break;
      case "undo": {
        const l = s.loans.find((l) => l.num === s.undo);
        s.undo = 0;
        if (!l || !l.back) break;
        l.back = false;
        if (l.damagedOnReturn)
          s.damaged = s.damaged.filter((id) => id !== l.asset);
        log(
          l,
          "Correction: check-in by " +
            l.backBy +
            " undone by " +
            now().desk +
            ". Slip open again.",
        );
        for (const k of ["backAt", "backBy", "receivedBy", "damagedOnReturn"])
          delete l[k];
        s.notice = "Check-in undone. Slip L-" + l.num + " is open again.";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  const norm = (x) =>
    String(x)
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase();
  function checkIn(l, by, cond) {
    l.back = true;
    l.backAt = now().short;
    l.backBy = by;
    l.receivedBy = now().desk;
    l.damagedOnReturn = cond === "damaged";
    if (l.damagedOnReturn && !s.damaged.includes(l.asset)) s.damaged.push(l.asset);
    log(
      l,
      "Returned by " +
        by +
        ", received by " +
        now().desk +
        (l.damagedOnReturn ? ", damaged: sent to workshop" : ", working"),
    );
    s.undo = l.num;
    s.quickError = "";
    openForm(null);
    const r = getReq(l.req);
    const left = s.loans.filter((o) => o.req === l.req && !o.back).length;
    commit(
      l.asset +
        " checked in from " +
        by +
        ". Slip L-" +
        l.num +
        " closed. " +
        (l.damagedOnReturn ? "Unit sent to the workshop. " : "") +
        (left
          ? left + (left > 1 ? " items" : " item") + " still out on " + r.id + "."
          : r.id + " kit is complete."),
    );
  }
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-checkin]")) {
      const l = s.loans.find((l) => l.num === Number(f.dataset.num));
      const by = String(form.get("by"));
      const typed = String(form.get("unit")).trim();
      if (!l || l.back || !people.includes(by) || !typed) return;
      const unit = assets.find((a) => norm(a.id) === norm(typed));
      if (!unit || unit.id !== l.asset) {
        const other = unit && out(unit.id);
        s.formError = !unit
          ? "No unit “" + typed + "” on the register. Check the label again."
          : unit.id +
            " is not on this slip. " +
            (other
              ? unit.id + " is out on slip L-" + other.num + "."
              : inRepair(unit)
                ? unit.id + " is booked into the workshop."
                : unit.id + " should be on the shelf in bin " + unit.bin + ".");
        commit();
        return;
      }
      checkIn(l, by, String(form.get("cond")));
      return;
    }
    if (f.matches("[data-quick]")) {
      const typed = String(form.get("unit")).trim();
      if (!typed) return;
      const unit = assets.find((a) => norm(a.id) === norm(typed));
      const l = unit && out(unit.id);
      if (!l) {
        s.quickError = !unit
          ? "No unit “" + typed + "” on the register. Nothing was changed. Check the label again."
          : unit.id +
            " has no open slip, so nothing was changed. It should be " +
            (inRepair(unit) ? "in the workshop." : "on the shelf in bin " + unit.bin + ".");
        commit();
        return;
      }
      const by = String(form.get("by")) || l.holder || l.who;
      if (!people.includes(by)) return;
      checkIn(l, by, String(form.get("cond")));
      return;
    }
    if (f.matches("[data-custody]")) {
      const l = s.loans.find((l) => l.num === Number(f.dataset.num));
      const holder = String(form.get("holder"));
      const expect = String(form.get("expect"));
      if (
        !l ||
        l.back ||
        !people.includes(holder) ||
        !dueTimes.includes(expect)
      )
        return;
      l.holder = holder;
      l.expect = expect;
      l.heldAt = now().short;
      log(
        l,
        "Now with " +
          holder +
          ", expected " +
          expect +
          ". Logged by " +
          now().desk +
          ". Borrower stays " +
          l.who +
          ".",
      );
      s.notes.push({
        phase: s.phase,
        by: "Slip L-" + l.num + " · logged at the counter",
        text:
          slipName(l) +
          " (" +
          getReq(l.req).club +
          ") is now with " +
          holder +
          ". Expected back " +
          expect +
          ". Issued to " +
          l.who +
          ", due " +
          l.due +
          ".",
      });
      openForm(null);
      commit(
        "Slip L-" +
          l.num +
          " updated: with " +
          holder +
          ", expected " +
          expect +
          ".",
      );
      return;
    }
    if (f.matches("[data-kit]")) {
      const r = getReq(f.dataset.req);
      if (!r) return;
      const missing = missingTypes(r);
      const who = String(form.get("who"));
      const due = String(form.get("due"));
      if (!people.includes(who) || !dueTimes.includes(due)) return;
      const picks = missing.map((_, i) =>
        getAsset(String(form.get("unit" + i))),
      );
      const bad = picks.findIndex(
        (a, i) => !a || a.type !== missing[i] || inRepair(a) || out(a.id),
      );
      if (bad >= 0) {
        s.formError = "Pick an available " + missing[bad] + ".";
        commit();
        return;
      }
      let num = Math.max(...s.loans.map((l) => l.num));
      for (const a of picks)
        s.loans.push({
          num: ++num,
          req: r.id,
          asset: a.id,
          who,
          due,
          out: now().short,
          back: false,
          history: [
            now().short + " · Issued to " + who + " by " + now().desk + ", due " + due,
          ],
        });
      openForm(null);
      commit(
        "Issued " +
          picks.map((a) => a.id).join(", ") +
          " to " +
          who +
          " for " +
          r.id +
          ". One slip per unit.",
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || inRepair(unit) || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({
      num,
      req,
      asset,
      who,
      due,
      out: now().short,
      back: false,
      history: [
        now().short + " · Issued to " + who + " by " + now().desk + ", due " + due,
      ],
    });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          Object.hasOwn(dueMinute, l.due),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      form: null,
      formError: "",
      quickError: "",
      damaged: Array.isArray(d.damaged) ? d.damaged.slice() : [],
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
