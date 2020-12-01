// this is your arduino server
let server =  window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000':'https://teaganlamp.com';
var socket = io.connect(server);

const form = document.getElementById('username-form');
const lampButton = document.getElementById('lamp-button');
const clickCount = document.getElementById('click-count');
const usernameInput = document.getElementById('username-input');
const introSection = document.getElementById('intro-text');
const bodySection = document.getElementById('content-wrap');
const userDiv = document.getElementById('user-div');

var username;
var userClicks;
var leaderboard;
if (localStorage.getItem('username') == null) {
  // show and get username input
  form.style.display = '';

} else {
  introSection.classList.remove('blurry-text');
  bodySection.style.display = '';
  form.style.display = 'none';
  username = localStorage.getItem('username');
  document.getElementById('username').innerText = username;

  console.log('Welcome Back! ' + username);
  getLamp() // updates lamp and total clicks and user clicks
  userDiv.style.opacity = 1;
}

// need to fetch status of lamp (on or off) from server
socket.on('lamp changed', function(response) {
  // hopefully this updates my client isLampOn variable
  changeLampButton(response.isLampOn, response.totalClicks)

  // TODO: fetch request for leaderboard and update
  
});


function getLamp() {
  fetch(`${server}/getLampAndClicksAndUserClicks`, {
    method: 'POST',
    body: JSON.stringify({'username': username}),
    headers: {
      'content-type': 'application/json'
    }
  }).then(response => response.json())
    .then(response => {
      changeLampButton(response.isLampOn, response.totalClicks);
      userClicks = parseInt(response.userClicks);

      document.getElementById('userClicks').innerText = 'clicks: ' + String(userClicks);
    }).catch((error) => {
      console.error('Error:', error);
  });

  fetch(`${server}/leaderboard`)
    .then(response => response.json())
    .then(object => {
      leaderboard = object;
      // console.log("ALL SAVED USERS (since page load): ", leaderboard)

  })
}


async function changeLampButton(isLampOn, totalClicks) {
  if (!isLampOn) {
    lampButton.checked = false;

  } else {
    lampButton.checked = true;
  }

  clickCount.innerText = 'THIS LAMP HAS BEEN CHANGED ' + String(totalClicks) + ' TIMES';
}

async function changeLeaderboard(leaderboard) {
  // TODO: !!
}

async function doLamp() {
  // fetch request to change lamp
  userClicks += 1; // local clicks
  document.getElementById('userClicks').innerText = 'clicks: ' + String(userClicks);

  fetch(`${server}/changeLamp`, {
    method: 'POST',
    body: JSON.stringify({'username': username}),
    headers: {
      'content-type': 'application/json'
    }
  }).catch((error) => {
      console.error('Error:', error);
  });
} 

function createUser(ele) {
  if (event.keyCode == 13) {
    event.preventDefault();
    username = ele.value

    fetch(`${server}/createUser`, {
      method: 'POST',
      body: JSON.stringify({'username': username}),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => response.json())
      .then(response => {
      form.classList.add('animate__fadeOut')
      localStorage.setItem('username', username);
      getLamp() // sets userclicks and total clicks and lampbutton
      bodySection.style.display = '';
      introSection.classList.remove('blurry-text');
      document.getElementById('username').innerText = username;
      document.getElementById('userClicks').innerText = 'clicks: ' + String(userClicks);
      userDiv.style.opacity = 1;

      if (response.loggedIn) {
        console.log('Welcome back! ' + username);
      } else {
        console.log('Welcome ' + username);
      }

    })
      
    
  } 
};

function switchUser() {
  localStorage.removeItem('username')
  introSection.classList.add('blurry-text');
  bodySection.style.display = 'none';
  form.style.display = '';
  form.classList.remove('animate__fadeOut')
  form.classList.add('animate__fadeIn')
  userDiv.style.opacity = 0;
}

lampButton.addEventListener('click', doLamp);

form.addEventListener('mouseover', function() {
  window.setTimeout(function() {
    usernameInput.focus();
  }, 0);
});
