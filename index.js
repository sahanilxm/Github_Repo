document.addEventListener('DOMContentLoaded', function () {
    const queryParams = new URLSearchParams(window.location.search);
    const username = queryParams.get('username');

    if(!username){
        console.error('GitHub username not provided.');
    }
    else{
        const profileApiUrl = `https://api.github.com/users/${username}`;
        const apiUrl = `https://api.github.com/users/${username}/repos`;

        const defaultPerPage = 10;
        const maxPerPage = 100;
        let currentPage = 1;
        let perPage = defaultPerPage;
        let totalRepositories = 0;

        fetchProfile(profileApiUrl);

        function fetchProfile(profileApiUrl){
        fetch(profileApiUrl)
            .then(response => {
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json().then( profile => {
                totalRepositories = parseInt(profile.public_repos, 10);
                console.log(totalRepositories);

                fetchRepositories(apiUrl, currentPage, perPage);
                });
            })
            .catch(error => {
            console.error('Error fetching total repositories count:', error);
            });
        }

        function fetchRepositories(url, page, perPage){
        console.log(url, page, perPage);
        fetch(`${url}?page=${page}&per_page=${Math.min(perPage, maxPerPage)}`)
            .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json().then(repositories => {
                displayRepositories(repositories);
                displayPagination(totalRepositories);
            });
            })
            .catch(error => {
            console.error('Error fetching repositories:', error);
            });
        }

        function displayRepositories(repositories){
            const container = document.getElementById('repositories-container');
            container.innerHTML = '';

            if(repositories.length === 0){
                container.innerHTML = '<p>No repositories found.</p>';
            }else{
                const list = document.createElement('ul');
                repositories?.forEach(repo => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${repo.name}</strong>: ${repo.description || 'No description'}`;
                list.appendChild(listItem);
                });
                container.appendChild(list);
            }
        }

        function displayPagination(totalRepositories) {
            const totalPages = Math.ceil(totalRepositories / Math.min(perPage, maxPerPage));
            console.log(totalRepositories, totalPages);
            const paginationContainer = document.getElementById('pagination-container');
            paginationContainer.innerHTML = '';

            const prevButton = document.createElement('button');
            prevButton.innerText = 'Previous';
            prevButton.addEventListener('click', function () {
                if (currentPage > 1) {
                currentPage--;
                fetchRepositories(apiUrl, currentPage, perPage);
                }
            });
            paginationContainer.appendChild(prevButton);

            const currentPageElement = document.createElement('span');
            currentPageElement.innerText = `Page ${currentPage}`;
            paginationContainer.appendChild(currentPageElement);

            const nextButton = document.createElement('button');
            nextButton.innerText = 'Next';
            nextButton.addEventListener('click', function () {
                console.log('Next Button Clicked');
                if (currentPage < totalPages) {
                currentPage++;
                fetchRepositories(apiUrl, currentPage, perPage);
                }
            });
            paginationContainer.appendChild(nextButton);

            const perPageSelect = document.createElement('select');
            perPageSelect.innerHTML = `
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
            `;
            perPageSelect.value = perPage.toString();
            perPageSelect.addEventListener('change', function (event) {
                perPage = parseInt(event.target.value, 10);
                currentPage = 1; 
                fetchRepositories(apiUrl, currentPage, perPage);
            });

            paginationContainer.appendChild(perPageSelect);
        }
    }
});


const submitForm = () => {
    const username = document.getElementById('username').value;
    window.location.href = `mainPage.html?username=${username}`;
}