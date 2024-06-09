// HEADER CAROUSEL------------------------------------------------------------

//import notiflix for pop-ups
// import Notiflix from 'notiflix';

document.addEventListener("DOMContentLoaded", function () {
  const carouselItems = document.querySelectorAll(".hero-carousel-item");
  let currentIndex = 0;
  const intervalTime = 10000;

  function showNextImage() {
    carouselItems[currentIndex].style.display = "none";
    currentIndex = (currentIndex + 1) % carouselItems.length;
    carouselItems[currentIndex].style.display = "block";
  }
  setInterval(showNextImage, intervalTime);
});

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

  const NUMBEROFITEMSPERREQUEST = 20;
  const NUMBEROFITEMSPERPAGE = 9;

  let currentLibraryView = "watched";
  let currentPage = 1;
  let totalPages = 20; // Assume 20 pages initially

  // Fetch movies for the homepage
  fetchMovies(currentPage);

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
        <p>${movie.vote_average.toFixed(1)}</p>
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

  // Function to fetch movies for a given page
  function fetchMovies(page) {
    let needMorePages = false;
    let completeData = [];

    let actualPage =
      Math.floor((page * NUMBEROFITEMSPERPAGE) / NUMBEROFITEMSPERREQUEST) + 1;
    //console.log("actual page is " + actualPage);

    if (
      page * NUMBEROFITEMSPERPAGE - NUMBEROFITEMSPERREQUEST * (actualPage - 1) <
      NUMBEROFITEMSPERPAGE
    ) {
      needMorePages = true;
    }

    //console.log("actual page afterwards is " + actualPage);

    fetch(
      `${apiUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=${actualPage}`
    )
      .then((response) => response.json())
      .then((data1) => {
        if (needMorePages) {
          completeData = data1.results.slice(
            ((page - 1) * NUMBEROFITEMSPERPAGE) % NUMBEROFITEMSPERREQUEST,
            NUMBEROFITEMSPERREQUEST
          );
          fetch(
            `${apiUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=${
              actualPage + 1
            }`
          )
            .then((response) => response.json())
            .then((data2) => {
              completeData = completeData.concat(
                data2.results.slice(
                  0,
                  (page * NUMBEROFITEMSPERPAGE) % NUMBEROFITEMSPERREQUEST
                )
              );
              displayMovies(completeData);
              updatePagination();
            });
        } else {
          displayMovies(
            data1.results.slice(
              ((page - 1) * NUMBEROFITEMSPERPAGE) % NUMBEROFITEMSPERREQUEST,
              (page * NUMBEROFITEMSPERPAGE) % NUMBEROFITEMSPERREQUEST
            )
          );
          updatePagination();
        }
      });
  }

  // Function to update pagination
  function updatePagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ""; // Clear previous pagination buttons

    // Create pagination buttons
    const prevButton = createPaginationButton("«", "prev");
    pagination.appendChild(prevButton);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, i);
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pagination.appendChild(pageButton);
      }
    } else {
      // Always show the first page button
      const firstPageButton = createPaginationButton(1, 1);
      pagination.appendChild(firstPageButton);
      if (currentPage === 1) {
        firstPageButton.classList.add("active");
      }

      if (currentPage > 4) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        pagination.appendChild(ellipsis);
      }

      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i, i);
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pagination.appendChild(pageButton);
      }

      if (currentPage < totalPages - 3) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        pagination.appendChild(ellipsis);
      }

      // Always show the last page button
      const lastPageButton = createPaginationButton(totalPages, totalPages);
      pagination.appendChild(lastPageButton);
      if (currentPage === totalPages) {
        lastPageButton.classList.add("active");
      }
    }

    const nextButton = createPaginationButton("»", "next");
    pagination.appendChild(nextButton);
  }

  // Function to create pagination button
  function createPaginationButton(label, page) {
    const button = document.createElement("button");
    button.textContent = label;
    button.setAttribute("data-page", page);
    button.classList.add("pagination-item");
    return button;
  }

  // Event listener for pagination buttons
  document
    .getElementById("pagination")
    .addEventListener("click", function (event) {
      const target = event.target;
      if (target.tagName === "BUTTON") {
        const page = target.getAttribute("data-page");
        if (page === "prev") {
          if (currentPage > 1) {
            currentPage--;
            fetchMovies(currentPage);
          }
        } else if (page === "next") {
          if (currentPage < totalPages) {
            currentPage++;
            fetchMovies(currentPage);
          }
        } else {
          currentPage = parseInt(page);
          fetchMovies(currentPage);
        }
      }
    });

  // ------------------------------Display movie details------------------------------ //
  function displayMovieDetails(movie) {
    let addOrRemoveWatched = "Add to Watched";
    let inWatched = false;
    let addOrRemoveQueue = "Add to Queue";
    let inQueue = false;

    let library = JSON.parse(localStorage.getItem("watched")) || [];

    if (!library.some((libMovie) => libMovie.id === movie.id)) {
      //Notiflix.Notify.success("Movie not in watched library.");
    } else {
      //Notiflix.Notify.info("Movie already in watched library.");
      addOrRemoveWatched = "Remove from Watched";
      inWatched = true;
    }

    library = JSON.parse(localStorage.getItem("queue")) || [];

    if (!library.some((libMovie) => libMovie.id === movie.id)) {
      //Notiflix.Notify.success("Movie not in queue.");
    } else {
      //Notiflix.Notify.info("Movie already in queue.");
      addOrRemoveQueue = "Remove from Queue";
      inQueue = true;
    }

    movieDetails.innerHTML = `
    <div class="modal-container">
      <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}">
      <div class="modal-side-info">
      <h2>${movie.title}</h2>
     
      <div class="list-div">
      <ul class="left-list">
      <li>Vote/ Votes</li>
      <li>Popularity</li>
      <li>Original Title</li>
      <li>Genre</li>
      </ul>
      <ul class="right-list">
      <li><span class="vote-average">${movie.vote_average.toFixed(
        1
      )}</span> / ${movie.vote_count}</li>
      <li>${movie.popularity}</li>
      <li>${movie.original_title}</li>
      <li>${movie.genre_ids.join(", ")}</li>

      </ul>
      </div>
      <div class="side-info-about">
      <h4>About</h4>
      <p>${movie.overview}</p>
      </div>


      <div class="button-group">
        <button class="add-to-watched" data-id="${
          movie.id
        }">${addOrRemoveWatched}</button>
        <button class="add-to-queue" data-id="${
          movie.id
        }">${addOrRemoveQueue}</button>
      </div>
      </div>
      
      </div>
      `;
    console.log(movie);
    movieDetails.classList.remove("hidden");
    overlay.classList.remove("hidden");

    movieDetails
      .querySelector(".add-to-watched")
      .addEventListener("click", () => {
        if (!inWatched) {
          addToLibrary(movie, "watched");
        } else {
          removeFromLibrary(movie, "watched");
        }
      });

    movieDetails
      .querySelector(".add-to-queue")
      .addEventListener("click", () => {
        if (!inQueue) {
          addToLibrary(movie, "queue");
        } else {
          removeFromLibrary(movie, "queue");
        }
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
      Notiflix.Notify.success(`Successfully added movie to ${type}.`);
    } else {
      Notiflix.Notify.info(`Movie already in ${type}.`);
    }
    displayMovieDetails(movie);
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
        <p>${movie.vote_average.toFixed(1)}</p>
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
    Notiflix.Notify.success("Successfully removed movie from library.");
    displayMovieDetails(movieToRemove);
    displayLibrary();
  }
});

//btn to top smooth animation
function scrollToTop() {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
}

// Show/hide the button based on the scroll position
window.addEventListener("scroll", function () {
  const scrollToTopBtn = document.getElementById("upward");
  if (
    document.documentElement.scrollTop > 300 ||
    document.body.scrollTop > 300
  ) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
});

// -----------------team modal=====================

// ===========team modal 2==
// Selectăm elementele necesare
const footerText = document.getElementById("footer-text");
const modal = document.getElementById("myModal");
const closeModal = document.getElementsByClassName("close")[0];

// Când se face click pe textul din footer, se afișează modalul
footerText.onclick = function () {
  modal.style.display = "block";
};

// Când se face click pe (x), se închide modalul
closeModal.onclick = function () {
  modal.style.display = "none";
};

// Când se face click în afara modalului, se închide modalul
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
