'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); //takes last 10 numbers

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration; //min
  }
}

class Running extends Workout {
   constructor(coords, distance, duration, cadence ) {
       super(coords, distance, duration);
       this.cadence = cadence;
       this.calcPace();
   }

   calcPace() {
     // min/km
     this.pace = this.duration / this.distance;
     return this.pace;
   }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain ) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39,-12], 5.2, 24, 178);
// const cycling1 = new Cycling([39,-12], 27, 95, 523);
// console.log(run1, cycling1);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
      this._getPosition();
      form.addEventListener('submit', this._newWorkout.bind(this) );
      inputType.addEventListener('change', this._toggleElevationField
    );
  }

  _getPosition() {
    //checking for browser geolocation supports
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
        alert('Ваша позиция не найдена')
      })
    }
  }

  _loadMap(position) {
      const { latitude } = position.coords
      const { longitude } = position.coords
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`) //taken from the google maps

      const coords = [latitude, longitude]

      //code taken from leaflet library
      this.#map = L.map('map').setView(coords, 13); //second argument is a zoom level

      //Adds map visualization
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.#map);

      //Onclick on the map
      this.#map.on('click', this._showForm.bind(this))
    }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    console.log(mapE);
    form.classList.remove('hidden')
    inputDistance.focus()
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  }

  _newWorkout(e) {

    e.preventDefault()

    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp)); //every method will return true if all inp are numbers. ...spread operator returns an array
    const positiveNumbers = (...inputs) => inputs.every(inp => inp > 0);
    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const {lat, lng} = this.#mapEvent.latlng;
    let workout;



    //If activity running, create running object
    if(type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if(
        // !Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || !positiveNumbers(distance, duration, cadence)
      )
        return alert('Inputs must be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);

    }

    //If activity cycling, create cycling object
    if(type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid
      if(
        !validInputs(distance, duration, elevation) || !positiveNumbers(distance, duration)
      )
        return alert('Inputs must be positive numbers!')

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }


    //Add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);


    //Render workout on map as marker


    L.marker([lat, lng] ).addTo(this.#map)
      .bindPopup(L.popup({maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: 'running-popup'})
      )
      .setPopupContent('Workout')
      .openPopup();

    //Render workout on list

    //Hide from + clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

  }

}

const app = new App();
// app._getPosition();



