(function () {
  "use strict";

  /*theme toggle*/

  const themeToggle = document.getElementById("themeToggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (prefersDark) document.body.classList.add("dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark");
    });
  }

  /*toast helper*/

  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 2800);
  }

  /*sidebar collapse (desktop)*/

  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapseBtn");

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener("click", function () {
      sidebar.classList.toggle("is-collapsed");
    });
  }

  /* ---------------- shared overlay: mobile sidebar + task drawer ----------------
     One backdrop element does double duty depending on what's open,
     so it's tracked with a single "owner" instead of two booleans. */

  const overlay = document.getElementById("drawerOverlay");
  const mobileNavBtn = document.getElementById("mobileNavBtn");
  const drawer = document.getElementById("taskDrawer");
  const drawerClose = document.getElementById("drawerClose");

  let overlayOwner = null; // "sidebar" | "drawer" | null

  function openOverlay(owner) {
    overlayOwner = owner;
    if (overlay) overlay.classList.add("is-shown");
    document.body.classList.add("no-scroll");
  }

  function closeOverlay() {
    if (overlayOwner === "sidebar" && sidebar) sidebar.classList.remove("is-open");
    if (overlayOwner === "drawer" && drawer) drawer.classList.remove("is-open");
    overlayOwner = null;
    if (overlay) overlay.classList.remove("is-shown");
    document.body.classList.remove("no-scroll");
  }

  if (mobileNavBtn && sidebar) {
    mobileNavBtn.addEventListener("click", function () {
      sidebar.classList.add("is-open");
      openOverlay("sidebar");
    });
  }

  if (overlay) overlay.addEventListener("click", closeOverlay);

  if (drawerClose) drawerClose.addEventListener("click", closeOverlay);

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860 && overlayOwner === "sidebar") closeOverlay();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlayOwner) closeOverlay();
  });

  /* ---------------- global search (Ctrl+K) ---------------- */

  const searchTrigger = document.getElementById("searchTrigger");
  const topbarSearchInput = document.querySelector(".topbar-search input");

  if (searchTrigger && topbarSearchInput) {
    searchTrigger.addEventListener("click", function () {
      topbarSearchInput.focus();
    });
  }

  document.addEventListener("keydown", function (e) {
    const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    if (isShortcut && topbarSearchInput) {
      e.preventDefault();
      topbarSearchInput.focus();
    }
  });

  /* ---------------- topbar actions that aren't wired to a backend ---------------- */

  const notifBtn = document.getElementById("notifBtn");
  if (notifBtn) {
    notifBtn.addEventListener("click", function () {
      notifBtn.classList.remove("has-dot");
      showToast("You're all caught up — no new notifications.");
    });
  }

  const createTaskBtn = document.getElementById("createTaskBtn");
  if (createTaskBtn) {
    createTaskBtn.addEventListener("click", function () {
      showToast("Task composer isn't wired up in this preview — try the + on a column instead.");
    });
  }

  const userMenuBtn = document.getElementById("userMenuBtn");
  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", function () {
      showToast("Account menu isn't wired up in this preview.");
    });
  }

  const workspaceSwitcher = document.getElementById("workspaceSwitcher");
  if (workspaceSwitcher) {
    workspaceSwitcher.addEventListener("click", function () {
      showToast("Workspace switching isn't wired up in this preview.");
    });
  }

  const aiCta = document.querySelector(".ai-cta");
  if (aiCta) {
    aiCta.addEventListener("click", function () {
      showToast("AI Assistant isn't built in this preview yet.");
    });
  }

  // every nav link / button still under construction shares one attribute
  document.querySelectorAll("[data-soon]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      const label = el.dataset.tip || el.textContent.trim() || "This";
      showToast(label + " isn't built in this preview yet.");
    });
  });

  // filter / group-by / export-style buttons that don't do anything real yet
  document.querySelectorAll(".ghost-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast(btn.textContent.trim() + " isn't wired up in this preview.");
    });
  });

  const addCollabBtn = document.querySelector(".board-add-collab");
  if (addCollabBtn) {
    addCollabBtn.addEventListener("click", function () {
      showToast("Inviting collaborators isn't wired up in this preview.");
    });
  }


  const board = document.getElementById("board");
  if (board) {

    let draggedCard = null;
    let cardCounter = board.querySelectorAll(".card").length;
    const avatarPalette = ["avatar-indigo", "avatar-cyan", "avatar-amber", "avatar-emerald"];

    function bindCard(card) {
      card.addEventListener("dragstart", function () {
        draggedCard = card;
        
        requestAnimationFrame(function () { card.classList.add("is-dragging"); });
      });

      card.addEventListener("dragend", function () {
        card.classList.remove("is-dragging");
        draggedCard = null;
        document.querySelectorAll(".column-cards.is-drag-over").forEach(function (list) {
          list.classList.remove("is-drag-over");
        });
        updateColumnCounts();
      });

      card.addEventListener("click", function () {
        openDrawer(card);
      });
    }

    function cardAfterPointer(list, y) {
      const cards = Array.prototype.slice.call(list.querySelectorAll(".card:not(.is-dragging)"));
      let closest = null;
      let closestOffset = -Infinity;
      cards.forEach(function (card) {
        const box = card.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
          closestOffset = offset;
          closest = card;
        }
      });
      return closest;
    }

    function initColumnDrop(list) {
      list.addEventListener("dragover", function (e) {
        if (!draggedCard) return;
        e.preventDefault();
        list.classList.add("is-drag-over");
        const after = cardAfterPointer(list, e.clientY);
        if (after) {
          list.insertBefore(draggedCard, after);
        } else {
          list.appendChild(draggedCard);
        }
      });

      list.addEventListener("dragleave", function (e) {
        if (e.target === list) list.classList.remove("is-drag-over");
      });

      list.addEventListener("drop", function (e) {
        e.preventDefault();
        list.classList.remove("is-drag-over");
      });
    }

    function updateColumnCounts() {
      board.querySelectorAll(".column").forEach(function (col) {
        const countEl = col.querySelector(".column-count");
        if (countEl) countEl.textContent = col.querySelectorAll(".card").length;
      });
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function createCard(title) {
      cardCounter += 1;
      const avatar = avatarPalette[cardCounter % avatarPalette.length];
      const initials = "ME";

      const card = document.createElement("article");
      card.className = "card";
      card.draggable = true;
      card.dataset.task = "t-new-" + cardCounter;
      card.innerHTML =
        '<p class="card-title">' + escapeHtml(title) + "</p>" +
        '<div class="card-meta"><span class="priority priority-medium" title="Medium priority"></span></div>' +
        '<div class="card-foot">' +
          '<span class="mini-avatar ' + avatar + '">' + initials + "</span>" +
          '<div class="card-foot-right"></div>' +
        "</div>";

      bindCard(card);
      return card;
    }

    function initColumnAdd(btn, list) {
      btn.addEventListener("click", function () {
        const title = window.prompt("Task title");
        if (!title || !title.trim()) return;
        list.appendChild(createCard(title.trim()));
        updateColumnCounts();
        showToast("Task added.");
      });
    }

    
    board.querySelectorAll(".card").forEach(bindCard);
    board.querySelectorAll(".column-cards").forEach(initColumnDrop);
    board.querySelectorAll(".column-add").forEach(function (btn) {
      initColumnAdd(btn, btn.closest(".column").querySelector(".column-cards"));
    });

    const addColumnBtn = document.querySelector(".add-column-btn");
    const columnDotColors = ["#A1A1AA", "#06B6D4", "#4F46E5", "#F59E0B", "#10B981", "#EC4899"];
    let columnsAdded = 0;

    if (addColumnBtn) {
      addColumnBtn.addEventListener("click", function () {
        const name = window.prompt("Name this column");
        if (!name || !name.trim()) return;

        const key = "col-" + Date.now();
        const color = columnDotColors[columnsAdded % columnDotColors.length];
        columnsAdded += 1;

        const column = document.createElement("div");
        column.className = "column";
        column.dataset.column = key;
        column.innerHTML =
          '<div class="column-head">' +
            '<span class="column-dot" style="background:' + color + '"></span>' +
            "<h3>" + escapeHtml(name.trim()) + "</h3>" +
            '<span class="column-count">0</span>' +
            '<button class="column-add" aria-label="Add task">+</button>' +
          "</div>" +
          '<div class="column-cards" data-list="' + key + '"></div>';

        board.insertBefore(column, addColumnBtn);

        const list = column.querySelector(".column-cards");
        initColumnDrop(list);
        initColumnAdd(column.querySelector(".column-add"), list);

        showToast('"' + name.trim() + '" column added.');
      });
    }

    /*task detail drawer*/

    function openDrawer(card) {
      if (!drawer) return;
      const title = card.querySelector(".card-title");
      const titleInput = document.getElementById("drawerTitle");
      if (title && titleInput) titleInput.value = title.textContent.trim();
      drawer.classList.add("is-open");
      openOverlay("drawer");
    }

    /*time tracker*/

    const timerToggle = document.getElementById("timerToggle");
    const timerDisplay = document.getElementById("timerDisplay");
    let timerInterval = null;

    function parseClock(str) {
      const parts = str.trim().split(":").map(Number);
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    function formatClock(totalSeconds) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return [h, m, s].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    }

    if (timerToggle && timerDisplay) {
      let seconds = parseClock(timerDisplay.textContent);

      timerToggle.addEventListener("click", function () {
        const running = timerToggle.classList.toggle("is-running");
        if (running) {
          timerInterval = setInterval(function () {
            seconds += 1;
            timerDisplay.textContent = formatClock(seconds);
          }, 1000);
        } else {
          clearInterval(timerInterval);
        }
      });
    }

    /*checklist progress*/

    const checklist = document.querySelector(".checklist");
    if (checklist) {
      const progressLabel = document.querySelector(".checklist-progress");
      const progressFill = document.querySelector(".progress-track i");

      checklist.addEventListener("change", function (e) {
        if (e.target.type !== "checkbox") return;
        const li = e.target.closest("li");
        li.classList.toggle("is-done", e.target.checked);

        const items = checklist.querySelectorAll("li");
        const done = checklist.querySelectorAll("li.is-done").length;

        if (progressLabel) progressLabel.textContent = done + "/" + items.length;
        if (progressFill) progressFill.style.width = (items.length ? (done / items.length) * 100 : 0) + "%";
      });
    }

    /*comments*/

    const commentInput = document.querySelector(".comment-input input");
    const commentSendBtn = document.querySelector(".comment-send");

    function postComment() {
      if (!commentInput || !commentInput.value.trim()) return;
      const commentRow = commentInput.closest(".comment-input");
      const comment = document.createElement("div");
      comment.className = "comment";
      comment.innerHTML =
        '<span class="mini-avatar avatar-indigo">ME</span>' +
        '<div class="comment-bubble">' +
          '<p class="comment-head"><b>You</b><span>Just now</span></p>' +
          "<p>" + escapeHtml(commentInput.value.trim()) + "</p>" +
        "</div>";
      commentRow.parentNode.insertBefore(comment, commentRow);
      commentInput.value = "";
    }

    if (commentSendBtn) commentSendBtn.addEventListener("click", postComment);
    if (commentInput) {
      commentInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") postComment();
      });
    }
  }
})();