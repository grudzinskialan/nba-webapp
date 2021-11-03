"use strict";

const dropdown = document.getElementById("teams-dropdown");
dropdown.length = 0;

const defaultOption = document.createElement("option");
defaultOption.text = "Choose Team";

//handling modal windows events
let modal = document.getElementById("myModal");
let span = document.getElementsByClassName("close")[0];
span.onclick = function () {
  modal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

const apiUrl = "https://data.nba.net/data/10s";

// const rosterHtml = document.createElement("p");
// rosterHtml.setAttribute("id", "roster");

dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

const getJSON = async function (url, errorMsg = "getJSON error") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
  return await response.json();
};

const getBtnValue = function () {
  const e = document.getElementById("teams-dropdown");
  //console.log(e.value);
  return e.value;
};

const getTeams = function () {
  getJSON("team.json")
    .then((data) => {
      const teamsData = data;
      //console.log(teamsData);
      showTeams(teamsData);
    })
    .catch((err) => console.error("cant fetch"));
};

//getTeams();

const showTeams = function showTeams(obj) {
  const id = getBtnValue();
  let teamm = obj.find((item) => item.teamId == id);
  showRoster(teamm);
  const html = `<div class="team-card">
      <h2> ${teamm.fullName} </h2>
      <img id="imgTeam" src="svg/${teamm.tricode}.svg">
      <p> Conference: ${teamm.confName}</p>
      <h3> Current roster: </h3>
      </div>`;
  document.getElementById("app").innerHTML = html;
};

const dropdownAppend = function () {
  getJSON("team.json").then(function (data) {
    let option;

    for (let i = 0; i < data.length; i++) {
      option = document.createElement("option");
      option.text = data[i].fullName;
      option.value = data[i].teamId;
      dropdown.add(option);
    }
  });
};

const showRoster = async function (team) {
  const roster = await getJSON(
    `${apiUrl}/prod/v1/2021/teams/${team.urlName}/roster.json`
  );
  const players = await getJSON("players.json");

  const rosterIDs = roster.league.standard;
  const playerIDs = players.league.standard;
  let rosterNames = "";
  for (let i = 0; i < rosterIDs.players.length; i++) {
    for (let j = 0; j < playerIDs.length; j++)
      if (rosterIDs.players[i].personId == playerIDs[j].personId) {
        rosterNames += `<li><a href="#" onclick="showPlayerInfo(${playerIDs[j].personId})">${playerIDs[j].firstName} ${playerIDs[j].lastName}`;
        document.getElementById("roster").innerHTML = rosterNames;
      }
  }
};

const showPlayerInfo = function (playerID) {
  modal.style.display = "block";
  getJSON("players.json").then(function (players) {
    const playerIDs = players.league.standard;
    let html = "";
    let player = playerIDs.find((item) => item.personId == playerID);
    if (player.yearsPro > 0) {
      html += `<h4>${player.firstName} ${player.lastName}</h5>
            <p>Height: ${player.heightMeters}m</p>
            <p>Weight: ${player.weightKilograms}kg</p>
            <p>Number: ${player.jersey}</p>
            <p>Position: ${player.pos}</p>
            <p>Date of Birth: ${player.dateOfBirthUTC}</p>
            <p>Draft: ${player.draft.seasonYear} Round: ${player.draft.roundNum} Pick: ${player.draft.pickNum}</p>
            <p>Years Pro: ${player.yearsPro}</p>
            <h6><a href="#" onClick=seePlayerStats(${player.personId})>Check Current Stats</h6>`;
    } else {
      html += `<h4>${player.firstName} ${player.lastName}</h5>
            <p>Height: ${player.heightMeters}m</p>
            <p>Weight: ${player.weightKilograms}kg</p>
            <p>Number: ${player.jersey}</p>
            <p>Position: ${player.pos}</p>
            <p>Date of Birth: ${player.dateOfBirthUTC}</p>
            <p>Years Pro: ${player.yearsPro}</p>`;
    }
    document.getElementById("modalContent").innerHTML = html;
  });
};

const seePlayerStats = async function (playerID) {
  modal.style.display = "block";
  const stats = await getJSON(
    `${apiUrl}/prod/v1/2021/players/${playerID}_profile.json`
  );
  const playersjson = await getJSON("players.json");

  const playerInfo = playersjson.league.standard;
  let st = stats.league.standard.stats.regularSeason.season[0].total;
  let html = "";
  let player = playerInfo.find((item) => item.personId == playerID);

  html += `<h3>${player.firstName} ${player.lastName}'s season stats </h3>
      <table id="player-stats-table" class="table table-striped table-hover"><tr>
      <th>GP</th><th>GS</th><th>MPG</th><th>APG</th><th>RPG</th><th>PPG</th>
      <th>SPG</th><th>BPG</th><th>FG%</th><th>FT%</th><th>3P%</th></tr>
      <tr><td>${st.gamesPlayed}</td>
      <td>${st.gamesStarted}</td>
      <td>${st.mpg}</td>
      <td>${st.apg}</td>
      <td>${st.rpg}</td>
      <td>${st.ppg}</td>
      <td>${st.spg}</td>
      <td>${st.bpg}</td>
      <td>${st.fgp}</td>
      <td>${st.ftp}</td>
      <td>${st.tpp}</td>
      </tr></table>`;
  document.getElementById("modalContent").innerHTML = html;
};

const getCurrentDate = function () {
  const today = new Date();
  let month = new Date();
  let monthCheck = new Date();
  let day = new Date();
  let dayCheck = new Date();
  if (dayCheck.getUTCDate() < 10) {
    day = "0" + day.getUTCDate();
  } else day = day.getUTCDate();
  if (monthCheck.getUTCMonth() + 1 < 10) {
    month = "0" + (month.getUTCMonth() + 1);
  } else month = month.getUTCMonth() + 1;
  // console.log(`${today.getUTCFullYear()}${month}${day}`);
  return `${today.getUTCFullYear()}${month}${day}`;
};

const getTodayInfo = function () {
  getJSON(`${apiUrl}/prod/v1/today.json`).then(function (data) {
    console.log(data);
  });
};

const fDate = function (d) {
  return d.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
};

const fGID = function (d) {
  let x = `${d}`;
  return x.slice(0, 6) + "/" + x.slice(6);
};

const getSchedule = async function () {
  const sch = await getJSON(`${apiUrl}/prod/v1/2021/schedule.json`);
  const team = await getJSON(`team.json`);

  const schedule = sch.league.standard;
  const teams = team;
  let html = "";
  let htmlToday = "";

  console.log(schedule);
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].seasonStageId == 2) {
      if (i < 100) {
        // if (schedule[i].startDateEastern == "20211019") {
        // console.log(schedule[i]);
        for (let j = 0; j < teams.length; j++) {
          for (let k = 0; k < teams.length; k++) {
            if (
              teams[j].teamId == schedule[i].hTeam.teamId &&
              teams[k].teamId == schedule[i].vTeam.teamId
            ) {
              // console.log(teams[j].fullName);
              // console.log(teams[k].fullName);
              let gID = "" + schedule[i].gameId;
              // console.log(gID);
              let gDate = "" + schedule[i].startDateEastern;
              let pomysl = `${gDate}${gID}`; //cyrk, js to parsuje na liczbe ktora jest potem za dluga
              let pomysl2 = pomysl.slice(2);
              //console.log(pomysl2);
              if (schedule[i].startDateEastern == getCurrentDate()) {
                htmlToday += `<li class="list-group-item mx-auto" style="width: 60rem; height: 3rem"><p id="game"><a href="#" onClick=showGameInfo(${pomysl2})>${fDate(
                  gDate
                )}: ${teams[k].fullName} @ ${
                  teams[j].fullName
                } <a class="btn btn-dark btn-sm" id="simA" href="#" onClick=seePrediction(${
                  teams[j].teamId
                },${teams[k].teamId})
              })>Check prediction</p></li>`;
              }
              html += `<li class="list-group-item mx-auto" style="width: 60rem; height: 3rem"><p id="game"><a href="#" onClick=showGameInfo(${pomysl2})>${fDate(
                gDate
              )}: ${teams[k].fullName} @ ${
                teams[j].fullName
              } <a class="btn btn-dark btn-sm mx-auto float-sm-end" id="simA" href="#" onClick=seePrediction(${
                teams[j].teamId
              },${teams[k].teamId})
            })>Check prediction</p></li>`;
            }
          }
        }
      }
    }
  }
  html = `<ul class="list-group">` + html + `</ul>`;
  document.getElementById("games").innerHTML = html;
  if (htmlToday == "") {
    document.getElementById(
      "games-today"
    ).innerHTML = `<p class="h5 text-center">No NBA Games Scheduled On ${fDate(
      getCurrentDate()
    )}</p>`;
  } else document.getElementById("games-today").innerHTML = htmlToday;
};

const seePrediction = function (teamID1H, teamID2V) {
  //console.log(teamID1H, teamID2V);
  modal.style.display = "block";
  getJSON("pred.json").then(function (data) {
    let b1 = 0;
    let b2 = 0;
    let html = "";

    let homeTeam = data.find((item) => item.teamId == teamID1H);
    let awayTeam = data.find((item) => item.teamId == teamID2V);
    //console.log(homeTeam);
    html += `<table class="table table-sm text-center"><th>${homeTeam.nickname} Projected Starting 5</th><th>Pos</th><th>${awayTeam.nickname} Projected Starting 5</th>`;
    for (let i = 0; i < 5; i++) {
      b1 += homeTeam.s5[i].BPM;
      b2 += awayTeam.s5[i].BPM;
      html += `<tr><td>${homeTeam.s5[i].Player.slice(
        0,
        homeTeam.s5[i].Player.indexOf("\\")
      )}</td><td>${homeTeam.s5[i].Pos}</td><td>${awayTeam.s5[i].Player.slice(
        0,
        awayTeam.s5[i].Player.indexOf("\\")
      )}</td>`;
    }
    let RES =
      (b1 - b2) / 15 +
      Math.random() * 0.6 +
      (Math.random() * 0.25 - 0.05) -
      0.1;

    html += `<div class="card text-center">
    <img id="imgSmall" class="card-img-top" style="display: block; margin-left: auto; margin-right:auto" `;
    if (RES > 0 && RES < 0.5) {
      html += `src="svg/${homeTeam.tricode}.svg">
      <div class="card-body">
      <h5 class="card-title">${homeTeam.fullName} are slight favorites to win `;
    } else if (RES >= 0.5) {
      html += `src="svg/${homeTeam.tricode}.svg">
      <div class="card-body">
      <h5 class="card-title">${homeTeam.fullName} are favorites to win.`;
    } else if (RES < 0 && RES > -0.5) {
      html += `src="svg/${awayTeam.tricode}.svg">
      <div class="card-body">
      <h5 class="card-title">${awayTeam.fullName} are slight favorites to win`;
    } else {
      html += `src="svg/${awayTeam.tricode}.svg">
      <div class="card-body">
      <h5 class="card-title">${awayTeam.fullName} are favorites to win`;
    }
    html += `</h5>
    </div>
  </div>`;
    document.getElementById("modalContent").innerHTML = html;
  });
};

const showGameInfo = function (gcombo) {
  modal.style.display = "block";
  let gd = "20" + fGID(gcombo); //bo sie laczyly, zmienialy na inty i cyrk ogolnie
  getJSON(`${apiUrl}/prod/v1/${gd}_boxscore.json`).then(function (data) {
    // console.log(data);
    let html = "";
    const d = data.basicGameData;
    let prevx = `${data.previousMatchup.gameDate}${data.previousMatchup.gameId}`;
    let pid = prevx.slice(2);
    html += `<h4 class="text-center">${fDate(d.homeStartDate)} at ${
      d.startTimeEastern
    }</h4>
    <h5 class="text-center">${d.arena.name} in ${d.arena.city}, ${
      d.arena.stateAbbr
    }
    <h3 class="text-center"> Away team: ${
      d.vTeam.score
    }</h3><img style="display: block; margin-left: auto; margin-right:auto" id="svgsmall" src="svg/${
      d.vTeam.triCode
    }.svg">
    <p class="text-center"> Team record: ${d.vTeam.win} - ${d.vTeam.loss} </p>
    <h3 class="text-center"> Home team: ${
      d.hTeam.score
    }</h3><img style="display: block; margin-left: auto; margin-right:auto" id="svgsmall" src="svg/${
      d.hTeam.triCode
    }.svg">
    <p class="text-center"> Current record: ${d.hTeam.win} - ${
      d.hTeam.loss
    } </p>
    <h6 class="text-center"><a href="#" onClick=showGameInfo(${pid})>See previous matchup </h6>`;

    document.getElementById("modalContent").innerHTML = html;
  });
};

const getConferenceStandings = function () {
  getJSON(`${apiUrl}/prod/v1/current/standings_conference.json`).then(function (
    data
  ) {
    let st = data.league.standard;
    let east = st.conference.east;
    let west = st.conference.west;
    let html1 = "";
    let html3 = `<h5>Season: ${st.seasonYear}/${st.seasonYear + 1}</h5>`;
    html1 += `<thead class="table-dark">
    <tr>
    <th>No.</th><th>Eastern Conference</th>
    <th>W</th>
    <th>L</th>
    <th>W %</th>
    <th>Streak</th>
    <th>Last 10</th>
    <th>No. </th>
    <th>Western Conference</th>
    <th>W</th>
    <th>L</th>
    <th>W %</th>
    <th>Streak</th>
    <th>Last 10</th>
    </tr></thead>`;
    for (let i = 0; i < 15; i++) {
      html1 += `<tr>
      <td>${i + 1}.</td>
      <td>${east[i].teamSitesOnly.teamName} ${
        east[i].teamSitesOnly.teamNickname
      }</td>
      <td>${east[i].win}</td>
      <td>${east[i].loss}</td>
      <td>${east[i].winPctV2}</td>
      <td>${east[i].teamSitesOnly.streakText}</td>
      <td>${east[i].lastTenWin}-${east[i].lastTenLoss}</td>
      <td>${i + 1}.</td>
      <td>${west[i].teamSitesOnly.teamName} ${
        west[i].teamSitesOnly.teamNickname
      }</td>
      <td>${west[i].win}</td>
      <td>${west[i].loss}</td>
      <td>${west[i].winPctV2}</td>
      <td>${west[i].teamSitesOnly.streakText}</td>
      <td>${west[i].lastTenWin}-${west[i].lastTenLoss}</td>
      </tr>`;
    }
    document.getElementById("standings-tabE").innerHTML = html1;
    document.getElementById("st-season").innerHTML = html3;
  });
};

const seasonPrediction = async function () {
  const sch = await getJSON(`${apiUrl}/prod/v1/2021/schedule.json`);
  const pred = await getJSON("pred.json");
  const schedule = sch.league.standard;
  let teamwins = [];
  for (let i = 0; i < pred.length; i++) {
    teamwins.push({
      teamid: pred[i].teamId,
      fullName: pred[i].fullName,
      teamtri: pred[i].tricode,
      conf: pred[i].confName,
      wins: 0,
      loss: 0,
    });
  }
  for (let i = 0; i < schedule.length; i++) {
    let b1 = 0;
    let b2 = 0;

    let homeTeam = pred.find((item) => item.teamId == schedule[i].hTeam.teamId);
    let awayTeam = pred.find((item) => item.teamId == schedule[i].vTeam.teamId);
    //console.log(homeTeam);
    for (let i = 0; i < 5; i++) {
      b1 += homeTeam.s5[i].BPM;
      b2 += awayTeam.s5[i].BPM;
    }
    let RES =
      (b1 - b2) / 20 + Math.random() * 1.5 + (Math.random() * 0.25 - 0.05);

    if (RES > 0) {
      let w = teamwins.find((item) => item.teamid == homeTeam.teamId);
      w.wins += 1;
      let l = teamwins.find((item) => item.teamid == awayTeam.teamId);
      l.loss += 1;
    } else {
      let w = teamwins.find((item) => item.teamid == awayTeam.teamId);
      w.wins += 1;
      let l = teamwins.find((item) => item.teamid == homeTeam.teamId);
      l.loss += 1;
    }
  }
  let teamwinsSort = teamwins.sort(
    (a, b) => parseFloat(b.wins) - parseFloat(a.wins)
  );
  let east = [];
  let west = [];
  for (let i = 0; i < teamwinsSort.length; i++) {
    if (teamwinsSort[i].conf === "East") {
      east.push(teamwinsSort[i]);
    } else west.push(teamwinsSort[i]);
  }
  // console.log(teamwinsSort);
  // console.log(west);
  let html1 = "";
  html1 += `<thead class="table-dark">
    <tr>
    <th>No.</th><th>Eastern Conference</th>
    <th>W</th>
    <th>L</th>
    <th>W %</th>
    <th>No. </th>
    <th>Western Conference</th>
    <th>W</th>
    <th>L</th>
    <th>W %</th>
    </tr></thead>`;
  for (let i = 0; i < east.length; i++) {
    html1 += `<tr>
      <td>${i + 1}.</td>
      <td>${east[i].fullName}</td>
      <td>${east[i].wins}</td>
      <td>${east[i].loss}</td>
      <td>${(east[i].wins / 0.82).toFixed(1)}</td>
      <td>${i + 1}.</td>
      <td>${west[i].fullName}</td>
      <td>${west[i].wins}</td>
      <td>${west[i].loss}</td>
      <td>${(west[i].wins / 0.82).toFixed(1)}</td>
      </tr>`;
  }
  document.getElementById("predStand").innerHTML = html1;
};

getSchedule();
dropdownAppend();
getConferenceStandings();
seasonPrediction();
