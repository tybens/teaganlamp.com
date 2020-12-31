let server = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000' : 'https://teaganlamp.com';
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
var leaderboard = [];

let welcomeBack = new MessageBox("#msgbox-area", {
    closeTime: 2000,
    hideCloseButton: true
});

if (localStorage.getItem('username') == null) {
    // show and get username input
    form.style.display = '';

} else {
    // they've already logged in, so go past the enter username page
    introSection.classList.remove('blurry-text');
    bodySection.style.display = '';
    form.style.display = 'none';
    username = localStorage.getItem('username');
    document.getElementById('username').innerText = username;
    welcomeBack.show("Welcome back, " + username + "!")
    getLamp() // updates lamp and total clicks and user clicks
    userDiv.style.opacity = 1;
}

// need to fetch status of lamp (on or off) from server
socket.on('lamp changed', function (response) {
    // hopefully this updates my client isLampOn variable
    changeLampButton(response.isLampOn, response.totalClicks)

    // user who clicked from request to change leaderboard
    // this is currently a terrible way to do it. :'(
    leaderboard[leaderboard.map(e => e[0]).indexOf(response.userClicked)][1] = String(1+parseInt(leaderboard[leaderboard.map(e => e[0]).indexOf(response.userClicked)][1]))
    redrawLeaderboard(leaderboard)

});

const topColors = {
    1: "#d4af37",
    2: "#c0c0c0",
    3: "#cd7f32"
}

function redrawLeaderboard(leaderboard) {

    var users = d3.select('table').selectAll('tr.user');

    users.remove();

    formatLeaderboard(leaderboard);
    
}

function formatLeaderboard(leaderboard) {
    // sort leaderboard!!
    leaderboard = leaderboard.sort((a, b) => b[1] - a[1]);
    // target the table element in which to add one div for each driver
    
    var main = d3
        .select('table');
    // for each driver add one table row
    // ! add a class to the row to differentiate the rows from the existing one
    // otherwise the select method would target the existing one and include one row less than the required amount
    var users = main
        .selectAll('tr.user')
        .data(leaderboard)
        .enter()
        .append('tr')
        .attr('class', 'user');

    // in each row add the information specified by the dataset in td elements
    // specify a class to style the elements differently with CSS

    // position using the index of the data points
    users
        .append('td')
        .text((d, i) => i + 1)
        .attr('class', 'position');


    // name followed by the team
    users
        .append('td')
        // include the last name in a separate element to style it differently
        // include the team also in another element for the same reason
        .html((d, i) => {
            // if 1st, 2nd, or 3rd make special color, else make white
            const color = !topColors[i+1] ? '#FFFFFF' : topColors[i+1];
            const weight = !(color=='#FFFFFF') ? 'bold' : 'normal';
            return `<span style="color: ${color}; font-weight: ${weight}">${d[0]}</span>`;
        })
        .attr('class', 'user');

    // gap from the first driver
    users
        .data(leaderboard)
        .append('td')
        .attr('class', 'clicks')
        .append('span')
        .text((d) => d[1]);
}

// function that is only called on log in and reload of page 
// gets current lamp, leaderboard, and userclicks
function getLamp() {
    fetch(`${server}/getLampAndClicksAndUserClicks`, {
        method: 'POST',
        body: JSON.stringify({ 'username': username }),
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
            // make 'dict' object into array of [[key, value], [key, value]]:
            leaderboard = Object.entries(object);
            // sort it because arrays have relative positioning!
            // format it using `d3`
            formatLeaderboard(leaderboard);

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
        body: JSON.stringify({ 'username': username }),
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
            body: JSON.stringify({ 'username': username }),
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
                    welcomeBack.show("Welcome back, " + username + "!")
                } else {
                    welcomeBack.show("Welcome to Teagan Lamp, " + username)
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

form.addEventListener('mouseover', function () {
    window.setTimeout(function () {
        usernameInput.focus();
    }, 0);
});