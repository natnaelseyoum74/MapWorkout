'use strict';

// let map;
// let mapEvent;

// class App {
//   #map;
//   #mapEvent;
//   constructor() {
//     this.getPosition();

//     form.addEventListener('submit', this.newWorkout.bind(this));

//     inputType.addEventListener('change', this.toggleElevationField());
//   }

//   getPosition() {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         this.loadMap.bind(this),
//         function () {
//           alert('problem with location');
//         }
//       );
//     }
//   }
//   loadMap(postion) {
//     const { latitude } = postion.coords;
//     const { longitude } = postion.coords;

//     console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//     const cords = [latitude, longitude];

//     console.log(this);
//     this.#map = L.map('map').setView(cords, 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(this.#map);

//     this.#map.on('click', this.showForm.bind(this));
//   }
//   showForm(mapE) {
//     this.#mapEvent = mapE;
//     form.classList.remove('hidden');
//     inputDistance.focus();
//   }
//   toggleElevationField() {
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   }
//   newWorkout(e) {
//     e.preventDefault();

//     inputDuration.value =
//       inputDistance.value =
//       inputElevation.value =
//       inputElevation.value =
//         '';
//     console.log(mapEvent.latlng);

//     const { lat, lng } = this.#mapEvent.latlng;

//     L.marker([lat, lng])
//       .addTo(this.#map)
//       .bindPopup(
//         L.popup({
//           maxWidth: 250,
//           minWidth: 100,
//           autoClose: false,
//           closeOnClick: false,
//           className: 'running-popup',
//         })
//       )
//       .setPopupContent('workout')
//       .openPopup();
//   }
// }

// const app = new App();

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// ///////////////////////////class app
let map, mapEvent;
// ////////////////////////////////class workout

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}  `;
  }
}
// ///////////////////////////////////class running
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, candence) {
    super(coords, distance, duration);
    this.candence = candence;
    this._getpace();
    this._setDescription();
  }
  _getpace() {
    this.pace = this.duration / this.distance;
    return this.pace.toFixed(1);
  }
}
////////////////////////////class cyclying
class Cyclying extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this._getspeed();
    this._setDescription();
  }

  _getspeed() {
    this.speed = this.duration / (this.distance / 60);
    return this.speed.toFixed(1);
  }
}
// ///////////////////
class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;
  constructor() {
    this._getLocalStorage();
    this._getPostion();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggelElevationFeild);
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
  }

  _getPostion() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('cant locate user');
        }
      );
    1;
  }

  _loadMap(postion) {
    const { latitude } = postion.coords;
    const { longitude } = postion.coords;
    console.log(latitude);

    this.#map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showMap.bind(this));
  }

  _showMap(mape) {
    this.#mapEvent = mape;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggelElevationFeild(e) {
    e.preventDefault();

    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const vaildnum1 = (...input) => input.every(inp => Number.isFinite(inp));
    const vaildnum2 = (...input) => input.every(inp => inp > 0);
    // get data from form
    let workoutt;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const coordss = [lat, lng];
    if (type === 'running') {
      const candence = +inputCadence.value;

      if (
        !vaildnum1(distance, duration, candence) ||
        !vaildnum2(distance, duration, candence)
      )
        return alert('wrong inpput');

      workoutt = new Running([lat, lng], distance, duration, candence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !vaildnum1(distance, duration, elevation) ||
        !vaildnum2(distance, duration, elevation)
      )
        return alert('wrong inpput');
      workoutt = new Cyclying([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workoutt);
    this.renderWorkoutMarker(workoutt);
    this.renderWorkoutList(workoutt);
    this.hideForm();
    this._setLocalStorage();
  }

  renderWorkoutList(workouttt) {
    let html = `<li class="workout workout--${workouttt.type}" data-id="${
      workouttt.id
    }">
   <h2 class="workout__title">${workouttt.description} on April 14</h2>
   <div class="workout__details">
     <span class="workout__icon">${
       workouttt.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
     }</span>
     <span class="workout__value">${workouttt.distance}</span>
     <span class="workout__unit">km</span>
   </div>
   <div class="workout__details">
     <span class="workout__icon">⏱</span>
     <span class="workout__value">${workouttt.duration}</span>
     <span class="workout__unit">min</span>
   </div>
  `;

    if (workouttt.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workouttt.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workouttt.candence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (workouttt.type === 'cycling') {
      html += `<div class="workout__details">
     <span class="workout__icon">⚡️</span>
     <span class="workout__value">${workouttt.Speed}</span>
     <span class="workout__unit">km/h</span>
   </div>
   <div class="workout__details">
     <span class="workout__icon">⛰</span>
     <span class="workout__value">${workouttt.elevation}</span>
     <span class="workout__unit">m</span>
   </div>
 </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  renderWorkoutMarker(workoutt) {
    L.marker(workoutt.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workoutt.type}-popup`,
        })
      )
      .setPopupContent(
        `${workoutt.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workoutt.description}`
      )
      .openPopup();
  }

  _moveToMarker(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(x => x.id === workoutEl.dataset.id);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animation: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(x => this.renderWorkoutList(x));
  }
}
const app = new App();
