import { getToken } from "./token.js";

// @ts-ignore
const tasks = [];
let schedulerRunning = false;

/**
 * Add a scheduled task.
 * @param {{ target: string, command: string, hour: number, minute: number }} task
 */
export function addTask(task) {
  tasks.push(task);
}

/**
 * Start the automation scheduler. Checks tasks every minute.
 * Only starts once even if called multiple times.
 */
export function startScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;

  setInterval(() => {
    const now = new Date();

    // @ts-ignore
    tasks.forEach(task => {
      if (now.getHours() === task.hour && now.getMinutes() === task.minute) {
        fetch("/commands/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
          },
          body: JSON.stringify({
            target: task.target,
            command: task.command
          })
        });
      }
    });
  }, 60000); // check every minute
}

// Example usage:
// addTask({ target: "pc-001", command: "restart", hour: 3, minute: 0 });
// startScheduler();