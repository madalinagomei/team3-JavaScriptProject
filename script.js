document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "584875d09aec925781121837a2fa3c3b";
  const apiUrl = "https://api.themoviedb.org/3";
  const imgBaseUrl = "https://image.tmdb.org/t/p/w500";
  const movieList = document.getElementById("movie-list");
  const movieDetails = document.getElementById("movie-details");
  const overlay = document.getElementById("overlay");
  const searchInput = document.getElementById("search-input");
  const themeSwitch = document.getElementById("theme-switch");
  const homeLink = document.getElementById("home-link");
  const libraryLink = document.getElementById("library-link");
  const mainContent = document.getElementById("main-content");
  const libraryContent = document.getElementById("library-content");
  const libraryMovieList = document.getElementById("library-movie-list");
  const watchedBtn = document.getElementById("watched-btn");
  const queueBtn = document.getElementById("queue-btn");

  let currentLibraryView = "watched";

  // Fetch movies for the homepage
  fetch(`${apiUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`)
    .then((response) => response.json())
    .then((data) => {
      displayMovies(data.results);
    });

  // Display movies in the main content
  function displayMovies(movies) {
    movieList.innerHTML = "";
    movies.forEach((movie) => {
      const movieItem = document.createElement("div");
      movieItem.classList.add("movie-item");
      movieItem.innerHTML = `
            <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date.split("-")[0]}</p>
            <p>${movie.vote_average}</p>
            <button class="add-to-library" data-id="${
              movie.id
            }" data-type="watched">Add to Watched</button>
            <button class="add-to-library" data-id="${
              movie.id
            }" data-type="queue">Add to Queue</button>
        `;
      movieItem.querySelectorAll(".add-to-library").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          addToLibrary(movie, button.dataset.type);
        });
      });
      movieItem.addEventListener("click", () => {
        displayMovieDetails(movie);
      });
      movieList.appendChild(movieItem);
    });
  }

  // Display movie details
  function displayMovieDetails(movie) {
    movieDetails.innerHTML = `
      <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}">
      <h2>${movie.title}</h2>
      <p><strong>Vote/Votes:</strong> ${movie.vote_average} / ${
      movie.vote_count
    }</p>
      <p><strong>Popularity:</strong> ${movie.popularity}</p>
      <p><strong>Original Title:</strong> ${movie.original_title}</p>
      <p><strong>Genre:</strong> ${movie.genre_ids.join(", ")}</p>
      <p><strong>About:</strong> ${movie.overview}</p>
      <div class="button-group">
        <button class="add-to-watched" data-id="${
          movie.id
        }">Add to Watched</button>
        <button class="add-to-queue" data-id="${movie.id}">Add to Queue</button>
      </div>
      `;
    movieDetails.classList.remove("hidden");
    overlay.classList.remove("hidden");

    movieDetails
      .querySelector(".add-to-watched")
      .addEventListener("click", () => {
        addToLibrary(movie, "watched");
      });

    movieDetails
      .querySelector(".add-to-queue")
      .addEventListener("click", () => {
        addToLibrary(movie, "queue");
      });

    // close modal
    overlay.addEventListener("click", closeModal);
  }

  function closeModal() {
    movieDetails.classList.add("hidden");
    overlay.classList.add("hidden");
    overlay.removeEventListener("click", closeModal);
  }

  // Search functionality
  searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    if (query.length > 2) {
      fetch(
        `${apiUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${query}`
      )
        .then((response) => response.json())
        .then((data) => {
          displayMovies(data.results);
        });
    }
  });

  // Theme switch functionality
  themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "dark-mode",
      document.body.classList.contains("dark-mode")
    );
  });

  // Load theme preference
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
    themeSwitch.checked = true;
  }
  // navigation
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    mainContent.classList.remove("hidden");
    libraryContent.classList.add("hidden");
  });

  libraryLink.addEventListener("click", (e) => {
    e.preventDefault();
    mainContent.classList.add("hidden");
    libraryContent.classList.remove("hidden");
    displayLibrary();
  });

  watchedBtn.addEventListener("click", () => {
    currentLibraryView = "watched";
    displayLibrary();
  });

  queueBtn.addEventListener("click", () => {
    currentLibraryView = "queue";
    displayLibrary();
  });

  // add to library

  function addToLibrary(movie, type) {
    let library = JSON.parse(localStorage.getItem(type)) || [];
    if (!library.some((libMovie) => libMovie.id === movie.id)) {
      library.push(movie);
      localStorage.setItem(type, JSON.stringify(library));
    }
  }

  //library
  function displayLibrary() {
    libraryMovieList.innerHTML = "";
    const library = JSON.parse(localStorage.getItem(currentLibraryView)) || [];
    library.forEach((movie) => {
      const movieItem = document.createElement("div");
      movieItem.classList.add("movie-item");
      movieItem.innerHTML = `
        <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date.split("-")[0]}</p>
        <p>${movie.vote_average}</p>
        <button class="remove-from-library" data-id="${
          movie.id
        }" data-type="${currentLibraryView}">Remove</button>
      `;

      movieItem
        .querySelector(".remove-from-library")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          removeFromLibrary(movie, currentLibraryView);
        });
      movieItem.addEventListener("click", () => {
        displayMovieDetails(movie);
      });
      libraryMovieList.appendChild(movieItem);
    });
  }

  // remove
  function removeFromLibrary(movieToRemove, type) {
    let library = JSON.parse(localStorage.getItem(type)) || [];
    library = library.filter((movie) => movie.id !== movieToRemove.id);
    localStorage.setItem(type, JSON.stringify(library));
    displayLibrary();
  }
});
