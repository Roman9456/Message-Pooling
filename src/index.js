import { interval, Subscription } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap, catchError } from 'rxjs/operators';
import './style.css';

const messagesTable = document.getElementById('messagesTable').querySelector('tbody');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let pollingSubscription = null;;

const fetchMessages = () => ajax.getJSON('http://94.228.162.197:3001/messages/unread').pipe(
  catchError(() => ({ status: "ok", timestamp: Math.floor(Date.now() / 1000), messages: [] }))
);

const startPolling = () => {
  if (!pollingSubscription) {
    pollingSubscription = interval(5000).pipe(
      switchMap(fetchMessages)
    ).subscribe(response => {
      const messages = response.messages || [];
      messages.forEach(msg => {
        const row = document.createElement('tr');
        const fromCell = document.createElement('td');
        const subjectCell = document.createElement('td');
        const receivedCell = document.createElement('td');

        fromCell.textContent = msg.from;
        subjectCell.textContent = msg.subject.length > 15 ? msg.subject.slice(0, 15) + '...' : msg.subject;
        const receivedDate = new Date(msg.received * 1000);
        receivedCell.textContent = receivedDate.toLocaleTimeString() + ' ' + receivedDate.toLocaleDateString();

        row.appendChild(fromCell);
        row.appendChild(subjectCell);
        row.appendChild(receivedCell);
        messagesTable.insertBefore(row, messagesTable.firstChild);
      });
    });
  }
};

const stopPolling = () => {
  if (pollingSubscription) {
    pollingSubscription.unsubscribe();
    pollingSubscription = null;
  }
};

startButton.addEventListener('click', startPolling);
stopButton.addEventListener('click', stopPolling);