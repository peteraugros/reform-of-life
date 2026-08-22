/* ---------------------------------------------------------------------
   Examination of conscience, and the card it produces.

   🔴 NOTHING HERE IS EVER WRITTEN DOWN. Not to localStorage beside the
   progress record, not to a cookie, not anywhere. The whole state is the
   `picked` object below, it lives in memory, and reloading the page
   destroys it. That is the single most important property of this file.

   A list of a named person's sins is the one artifact this site must never
   retain, and "their own device" is not an exception: phones are borrowed,
   left unlocked, shared with a parent, handed to a sibling. The safest
   place for this is nowhere, and the page says so out loud rather than
   leaving the reader to hope.

   The output is a card the reader PRINTS OR SAVES AS A PDF, which is the
   browser doing it locally with no server involved and nothing transmitted.
   That was chosen over emailing it, which would send exactly this document
   through a mail server to sit in an inbox indefinitely.
   --------------------------------------------------------------------- */
(function () {
  "use strict";

  /* Each item carries the QUESTION you put to yourself and the SENTENCE you
     would actually say. The card is built from the second, so it can be read
     from directly in the confessional rather than translated on the spot,
     which is precisely the moment nobody can think straight. */
  var GROUPS = [
    {
      title: "Toward God",
      hint: "Where he has come in the order of things.",
      items: [
        ["Have I prayed at all, or only when I wanted something?", "I have not really prayed, or only when I wanted something."],
        ["Have I missed Mass on a Sunday without a serious reason?", "I have missed Mass on Sunday without a serious reason."],
        ["Have I used God's name carelessly, or as a swear?", "I have used God's name carelessly."],
        ["Have I put something else at the center; money, work, my phone, somebody's opinion of me?", "I have put other things at the center of my life ahead of God."],
        ["Have I been ashamed to be known as a believer?", "I have been ashamed to be known as a believer."],
        ["Have I received communion when I knew I should not have?", "I have received communion when I knew I should not have."]
      ]
    },
    {
      title: "Toward other people",
      hint: "Most of it lives here, and most of it is small and repeated.",
      items: [
        ["Have I been unkind or cruel, in person or online?", "I have been unkind and at times cruel."],
        ["Have I lied, or let somebody believe something I knew was false?", "I have lied, and let people believe things I knew were false."],
        ["Have I taken what was not mine, including credit or time?", "I have taken what was not mine."],
        ["Have I gossiped, or repeated something that damaged someone?", "I have gossiped and damaged people's names."],
        ["Have I held on to anger, or refused to forgive?", "I have held on to anger and refused to forgive."],
        ["Am I harsher with my own family than with strangers?", "I have been harsh with my family."],
        ["Have I used another person, sexually or otherwise?", "I have used another person."],
        ["Have I looked at pornography?", "I have looked at pornography."],
        ["Have I been careless with somebody's trust?", "I have been careless with someone's trust."],
        ["Have I stayed silent when I should have defended someone?", "I stayed silent when I should have defended someone."],
        ["Have I envied what somebody else has?", "I have envied what others have."],
        ["Have I been generous only when it cost me nothing?", "I have been generous only when it cost me nothing."]
      ]
    },
    {
      title: "Toward yourself",
      hint: "The ones that are easiest to call personality rather than sin.",
      items: [
        ["Have I got drunk, or used something to escape?", "I have used drink or other things to escape."],
        ["Have I wasted whole days and then said I had no time?", "I have wasted my time and then claimed I had none."],
        ["Have I neglected my work, or the people depending on me?", "I have neglected my work and the people depending on me."],
        ["Have I despaired of myself, or believed I was past helping?", "I have despaired of myself."],
        ["Have I treated my body as though it did not matter?", "I have treated my body as though it did not matter."],
        ["Have I gone on doing something I know is wrong and stopped trying to stop?", "I have gone on doing what I know is wrong and stopped trying to stop."]
      ]
    }
  ];

  /* THE ENTIRE STATE. In memory, and only in memory. */
  var picked = {};

  var host = document.getElementById("exam");
  var cardHost = document.getElementById("confession-card");
  if (!host || !cardHost) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function count() { return Object.keys(picked).length; }

  function renderExam() {
    host.innerHTML = "";
    GROUPS.forEach(function (g, gi) {
      var wrap = el("div", "exam-group");
      wrap.appendChild(el("h3", null, g.title));
      wrap.appendChild(el("p", "exam-hint", g.hint));
      var list = el("div", "exam-list");
      g.items.forEach(function (pair, ii) {
        var key = gi + ":" + ii;
        var b = el("button", "exam-item" + (picked[key] ? " on" : ""));
        b.type = "button";
        b.setAttribute("aria-pressed", picked[key] ? "true" : "false");
        b.appendChild(el("span", "box", picked[key] ? "✓" : ""));
        b.appendChild(el("span", null, pair[0]));
        b.addEventListener("click", function () {
          if (picked[key]) delete picked[key]; else picked[key] = pair[1];
          renderExam();
          renderActions();
        });
        list.appendChild(b);
      });
      wrap.appendChild(list);
      host.appendChild(wrap);
    });
  }

  var actions;
  function renderActions() {
    if (!actions) {
      actions = el("div", "exam-actions");
      host.parentNode.appendChild(actions);
    }
    actions.innerHTML = "";

    var make = el("button", "card-btn", "Make my card");
    make.type = "button";
    make.disabled = count() === 0;
    make.addEventListener("click", renderCard);
    actions.appendChild(make);

    if (count() > 0) {
      var clear = el("button", "tool-btn quiet", "Clear");
      clear.type = "button";
      clear.addEventListener("click", function () {
        picked = {};
        cardHost.innerHTML = "";
        document.body.classList.remove("card-open");
        renderExam(); renderActions();
      });
      actions.appendChild(clear);
      actions.appendChild(el("span", "exam-count",
        count() + (count() === 1 ? " thing marked" : " things marked")));
    }
  }

  /* The card as words, for the share sheet and the clipboard. Built from the
     same picked set the card renders from, so the two can never disagree. */
  function cardAsText(sinceInput) {
    var when = (sinceInput && sinceInput.value.trim()) || "___";
    var lines = [
      "Bless me, Father, for I have sinned. It has been " + when + " since my last confession.",
      ""
    ];
    GROUPS.forEach(function (g, gi) {
      g.items.forEach(function (pair, ii) {
        if (picked[gi + ":" + ii]) lines.push("\u2022 " + pair[1]);
      });
    });
    lines.push("", "I am sorry for these and all my sins.", "");
    lines.push("Act of contrition:");
    lines.push("My God, I am sorry for my sins with all my heart. In choosing to do wrong and "
      + "failing to do good, I have sinned against you, whom I should love above all things. I "
      + "firmly intend, with your help, to do penance, to sin no more, and to avoid whatever "
      + "leads me to sin. Amen.");
    return lines.join("\n");
  }

  function renderCard() {
    cardHost.innerHTML = "";
    document.body.classList.add("card-open");

    var card = el("div", "card-sheet");
    card.appendChild(el("span", "label", "Take this in with you"));
    card.appendChild(el("h3", null, "Your card"));

    /* Step one, with the gap filled in by the person rather than guessed at. */
    var open = el("p", "card-say");
    open.appendChild(document.createTextNode("Bless me, Father, for I have sinned. It has been "));
    var since = el("input", "card-since");
    since.type = "text";
    since.value = "";
    since.placeholder = "two years";
    since.setAttribute("aria-label", "How long since your last confession");
    open.appendChild(since);
    open.appendChild(document.createTextNode(" since my last confession."));
    card.appendChild(open);

    var list = el("ul", "card-sins");
    GROUPS.forEach(function (g, gi) {
      g.items.forEach(function (pair, ii) {
        if (picked[gi + ":" + ii]) list.appendChild(el("li", null, pair[1]));
      });
    });
    card.appendChild(list);

    card.appendChild(el("p", "card-say", "I am sorry for these and all my sins."));

    card.appendChild(el("h3", null, "Then he will ask you to make an act of contrition"));
    card.appendChild(el("p", "card-say",
      "My God, I am sorry for my sins with all my heart. In choosing to do wrong and failing to do "
      + "good, I have sinned against you, whom I should love above all things. I firmly intend, with "
      + "your help, to do penance, to sin no more, and to avoid whatever leads me to sin. Amen."));

    card.appendChild(el("p", "record-note",
      "He absolves you; you answer “Amen.” Then do your penance before you leave. "
      + "Anything not on this card that comes to mind, say it anyway; the list is a help, not a limit."));

    /* ---- taking it with you ----
       🔴 PRINTING IS A DESKTOP ANSWER AND THIS IS READ ON A PHONE.
       On Android the print sheet at least offers "Save as PDF"; on an iPhone
       the only way out is a small share icon in the corner of the preview,
       which almost nobody finds. So the phone gets a phone answer first: the
       system share sheet, which puts the card straight into Notes, Files or
       a message, all of which the reader already knows how to find again.
       Copy is the fallback for anything without a share sheet, and printing
       stays for a computer, labelled honestly rather than promised. */
    /* ⚠️ Built at the moment of tapping, never at render. The blank for how
       long it has been is filled in AFTER the card appears, so text captured
       when the card was drawn would always carry an empty one. */
    var row = el("div", "card-actions exam-actions");

    if (navigator.share) {
      var share = el("button", "card-btn", "Save or send it");
      share.type = "button";
      share.addEventListener("click", function () {
        navigator.share({ title: "Confession card", text: cardAsText(since) })
          .catch(function () { /* the reader dismissed the sheet; not an error */ });
      });
      row.appendChild(share);
    }

    var copy = el("button", "tool-btn", "Copy the words");
    copy.type = "button";
    copy.addEventListener("click", function () {
      var plain = cardAsText(since);
      var done = function () {
        copy.textContent = "Copied. Paste it into your notes.";
        setTimeout(function () { copy.textContent = "Copy the words"; }, 4000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plain).then(done, function () { window.prompt("Copy this:", plain); });
      } else {
        window.prompt("Copy this:", plain);
      }
    });
    row.appendChild(copy);

    var print = el("button", "tool-btn quiet", "Print");
    print.type = "button";
    print.addEventListener("click", function () { window.print(); });
    row.appendChild(print);

    card.appendChild(row);

    var how = el("p", "record-note");
    how.textContent =
      "On a phone the quickest thing of all is a screenshot; it goes to your photos and you "
      + "will find it again without looking. Otherwise \u201cSave or send it\u201d opens the usual "
      + "share sheet, so you can drop it into Notes or send it to yourself. Whatever you do not "
      + "save disappears when you close this page, which is the way it should be.";
    card.appendChild(how);

    cardHost.appendChild(card);
    cardHost.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderExam();
  renderActions();
})();
