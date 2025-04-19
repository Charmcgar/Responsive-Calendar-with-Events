const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  chatInput = document.querySelector(".chat-input"),
  chatSubmit = document.querySelector(".chat-submit"),
  chatLog = document.querySelector(".chat-log");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventsArr = [];
getEvents();

function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;
  date.innerHTML = months[month] + " " + year;

  let days = "";

  // Previous month days
  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day">${i}</div>`;
      }
    }
  }

  // Next month days
  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListener();
}

// Chatbot functionality
chatSubmit.addEventListener("click", async () => {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Add user message to chat log
  addMessageToChatLog("You", userMessage);
  chatInput.value = "";

  // Call OpenAI API
  const response = await callOpenAIAPI(userMessage);

  // Add AI response to chat log
  addMessageToChatLog("AI", response);
});

function addMessageToChatLog(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Function to call OpenAI API
async function callOpenAIAPI(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `You are a helpful assistant for a calendar app. ${prompt}`,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].text.trim();

    // Parse response and add events if applicable
    if (text.toLowerCase().includes("event added")) {
      const [title, date, time] = parseEventDetails(prompt);
      addEventToCalendar(title, date, time);
    }

    return text;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
}

function parseEventDetails(prompt) {
  // Example: Extract event details from user input
  const title = prompt.match(/event\s"(.+?)"/i)?.[1] || "Untitled Event";
  const date = prompt.match(/on\s(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1];
  const time = prompt.match(/at\s(\d{1,2}:\d{2}(?:\s[APap][Mm])?)/i)?.[1];
  return [title, date, time];
}

function addEventToCalendar(title, date, time) {
  const [day, month, year] = date.split("/").map(Number);
  eventsArr.push({
    day,
    month,
    year,
    events: [{ title, time }],
  });
  updateEvents(day);
}
