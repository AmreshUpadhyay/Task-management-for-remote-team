(function(){
  "use strict";
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  const msgs = document.getElementById("chatMsgs");

  const aiReplies = [
    "Based on current sprint data, I recommend prioritising Arjun's blocked tasks first. That unblocks 5 downstream items and reduces the Product Launch risk from 87% to around 54%.",
    "Rhea's schedule is the most impacted. I can automatically move 'Interview 5 churned customers' and 'Write release notes' to Tom, who has capacity. Want me to proceed?",
    "Your team's peak productivity window is 10 AM–12 PM Tuesday through Thursday. Scheduling your most complex tasks in those windows should improve output by an estimated 18%.",
    "Sprints 14 and 15 both look healthy. The main concern is sprint 13 carryover — 2 tasks still unresolved that could slip into next week.",
    "I can generate a full risk report as a PDF or send a summary to your Slack #product channel. Which would you prefer?"
  ];
  let replyIdx = 0;

  function addMsg(text, isMe) {
    const row = document.createElement("div");
    row.className = "chat-row" + (isMe ? " chat-row-me" : "");
    if (isMe) {
      row.innerHTML = '<span class="mini-avatar avatar-indigo" style="width:26px;height:26px;font-size:10px;flex-shrink:0">SS</span><div class="chat-bubble">' + text + "</div>";
    } else {
      row.innerHTML = '<div class="chat-icon">AI</div><div class="chat-bubble">' + text + "</div>";
    }
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function send() {
    const v = input.value.trim();
    if (!v) return;
    addMsg(v, true);
    input.value = "";
    setTimeout(function(){
      addMsg(aiReplies[replyIdx % aiReplies.length], false);
      replyIdx++;
    }, 800);
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function(e){ if(e.key==="Enter") send(); });

  document.querySelectorAll(".rec-act").forEach(function(btn){
    btn.addEventListener("click", function(){
      const t = document.getElementById("toastText");
      const toast = document.getElementById("toast");
      if(t && toast){
        t.textContent = "Suggestion noted — I'll queue that action.";
        toast.classList.add("is-shown");
        clearTimeout(toast._t);
        toast._t = setTimeout(function(){ toast.classList.remove("is-shown"); }, 2800);
      }
    });
  });

  document.querySelector(".analyze-btn").addEventListener("click", function(){
    const t = document.getElementById("toastText");
    const toast = document.getElementById("toast");
    if(t && toast){
      t.textContent = "Running full workspace analysis…";
      toast.classList.add("is-shown");
      clearTimeout(toast._t);
      toast._t = setTimeout(function(){ toast.classList.remove("is-shown"); }, 2800);
    }
  });
})();