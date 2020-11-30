// this is your arduino server
let server =  window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000':'https://teaganlamp.com';
var socket = io.connect(server);

const form = document.getElementById('username-form');
const lampButton = document.getElementById('lamp-button');
const clickCount = document.getElementById('click-count');
const usernameInput = document.getElementById('username-input')
const introSection = document.getElementById('intro-text')
const bodySection = document.getElementById('content-wrap')

var username;
var userClicks;
if (localStorage.getItem('username') == null) {
// show and get username input


} else {
introSection.classList.remove('blurry-text');
form.style.display = 'none';
bodySection.style.display = '';
username = localStorage.getItem('username');
console.log('Welcome Back! ' + username)
getLamp()

}

// need to fetch status of lamp (on or off) from server
socket.on('lamp changed', function(response) {
// hopefully this updates my client isLampOn variable
changeLampButton(response.isLampOn, response.totalClicks)

// TODO: fetch request for leaderboard and update
fetch(`${server}/leaderboard`)
  .then(response => response.json())
  .then(leaderboard => {

})
});


async function getLamp() {
fetch(`${server}/getLampAndClicksAndUserClicks`, {
  method: 'POST',
  body: JSON.stringify({'username': username}),
  headers: {
    'content-type': 'application/json'
  }
}).then(response => response.json())
  .then(response => {
    changeLampButton(response.isLampOn, response.totalClicks);
    userClicks = parseInt(response.userClicks)
  }).catch((error) => {
    console.error('Error:', error);
});
}


async function changeLampButton(isLampOn, totalClicks) {
if (!isLampOn) {
  lampButton.checked = false

} else {
  lampButton.checked = true
}

clickCount.innerText = 'THIS LAMP HAS BEEN CHANGED ' + String(totalClicks) + ' TIMES'
}

async function changeLeaderboard(leaderboard) {
// TODO: !!
}

async function doLamp() {
// fetch request to change lamp
userClicks += 1; // local clicks

fetch(`${server}/changeLamp`, {
  method: 'POST',
  body: JSON.stringify({'username': username}),
  headers: {
    'content-type': 'application/json'
  }
}).then(response => response.json())
  .then(response => {
    // console.log(response)

  }).catch((error) => {
    console.error('Error:', error);
  });
} 

function createUser(ele) {
if (event.keyCode == 13) {
  event.preventDefault();
  console.log('ENTER')
  username = ele.value

  fetch(`${server}/createUser`, {
    method: 'POST',
    body: JSON.stringify({'username': username}),
    headers: {
      'content-type': 'application/json'
    }
  }).then(response => {
    if (response.status === 200) {
        localStorage.setItem('username', username);
        userClicks = 0;
        form.style.display = 'none';
        bodySection.style.display = '';
        console.log('Welcome! ' + localStorage.getItem('username'))
        // TODO: (maybe) show leaderboard
    } else {
      response.json().then(error => {
        console.log(error)
        // TODO: show username error (username already exists)
      })
    }
  })
} 
};
lampButton.addEventListener('click', doLamp);
form.addEventListener('mouseover', function() {
window.setTimeout(function() {
  usernameInput.focus();
}, 0);
});
