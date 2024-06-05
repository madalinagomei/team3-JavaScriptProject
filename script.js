document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "584875d09aec925781121837a2fa3c3b";
  const apiUrl = "https://api.themoviedb.org/3";
  const imgBaseUrl = "https://image.tmdb.org/t/p/w500";
  const movieList = document.getElementById("movie-list");
  const movieDetails = document.getElementById("movie-details");
  const searchInput = document.getElementById("search-input");
  const themeSwitch = document.getElementById("theme-switch");

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
                <img src="${imgBaseUrl + movie.poster_path}" alt="${
        movie.title
      }">
                <h3>${movie.title}</h3>
                <p>${movie.release_date.split("-")[0]}</p>
                <p>${movie.vote_average}</p>
            `;
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
            <p>${movie.overview}</p>
            <button id="back-btn">Back</button>
        `;
    movieDetails.classList.remove("hidden");
    document.getElementById("main-content").classList.add("hidden");
    document.getElementById("back-btn").addEventListener("click", () => {
      movieDetails.classList.add("hidden");
      document.getElementById("main-content").classList.remove("hidden");
    });
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
});
