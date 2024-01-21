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
            document.getElementById('profile-loader').style.display = 'block';
            fetch(profileApiUrl)
                .then(response => {
                if(!response.ok){
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                return response.json().then( profile => {
                    totalRepositories = parseInt(profile.public_repos, 10);
                    displayProfile(profile);
                    fetchRepositories(apiUrl, currentPage, perPage);
                    });
                })
                .catch(error => {
                console.error('Error fetching total repositories count:', error);
                })
                .finally(() => {
                    document.getElementById('profile-loader').style.display = 'none';
            });
        }

        function displayProfile(profile){
            const container = document.getElementById('profile-container');
            container.innerHTML = '';
            container.classList.add('secondary-text');

            const userName = document.createElement('h3');
            userName.classList.add('fw-bold', 'text-decoration-underline', 'primary-text')
            userName.innerHTML = profile?.name || profile?.login;
            container.append(userName);

            const userBio = document.createElement('p');
            userBio.innerHTML = profile?.bio;
            container.append(userBio);

            const publicRepos = document.createElement('p');
            publicRepos.innerHTML = `Total Public Repositories: ${totalRepositories}`;
            container.append(publicRepos);

        }

        function fetchRepositories(url, page, perPage){
            document.getElementById('repositories-loader').style.display = 'block';

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
                })
                .finally(() => {
                    document.getElementById('repositories-loader').style.display = 'none';
            });
        }

        function displayRepositories(repositories){
            const container = document.getElementById('repositories-container');
            container.innerHTML = '';

            if(repositories.length === 0){
                container.innerHTML = '<p>No repositories found.</p>';
            }else{
                repositories?.forEach(repo => {
                    const repository = document.createElement('div');
                    repository.classList.add('w-25', 'm-2', 'p-2', 'repo');
                    const repositoryName = document.createElement('strong');
                    repositoryName.classList.add('primary-text', 'text-decoration-underline');
                    repositoryName.innerHTML = `${repo.name}`;
                    const repositoryDescription = document.createElement('p');
                    repositoryDescription.classList.add('helper-text', 'mt-4');
                    repositoryDescription.innerHTML = `${repo.description || 'No description'}`;

                    const repositoryTopics = document.createElement('div');
                    repositoryTopics.classList.add('d-flex', 'flex-wrap');
                    const repositoryTopicsList = repo.topics;
                    repositoryTopicsList?.map((topic) => {
                        const repositoryTopic = document.createElement('button');
                        repositoryTopic.classList.add('m-1', 'secondary-btn');
                        repositoryTopic.innerHTML = topic;
                        repositoryTopics.appendChild(repositoryTopic);
                    })

                    repository.appendChild(repositoryName);
                    repository.appendChild(repositoryDescription);
                    repository.appendChild(repositoryTopics);
                    container.appendChild(repository);
                });
            }
        }

        function displayPagination(totalRepositories) {
            const totalPages = Math.ceil(totalRepositories / Math.min(perPage, maxPerPage));
            console.log(totalRepositories, totalPages);
            const paginationContainer = document.getElementById('pagination-container');
            paginationContainer.innerHTML = '';

            const prevButton = document.createElement('button');
            prevButton.innerText = 'Previous';
            prevButton.classList.add('my-4', 'mx-2', 'primary-btn');
            prevButton.addEventListener('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    fetchRepositories(apiUrl, currentPage, perPage);
                }
            });
            paginationContainer.appendChild(prevButton);

            const currentPageElement = document.createElement('span');
            currentPageElement.innerText = `Page ${currentPage}`;
            currentPageElement.classList.add('my-4', 'mx-2', 'secondary-btn');
            paginationContainer.appendChild(currentPageElement);

            const nextButton = document.createElement('button');
            nextButton.innerText = 'Next';
            nextButton.classList.add('my-4', 'mx-2', 'primary-btn');
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
            perPageSelect.classList.add('my-4', 'mx-2', 'secondary-btn');
            paginationContainer.appendChild(perPageSelect);
        }
    }
});


const submitForm = () => {
    const username = document.getElementById('username').value;
    window.location.href = `mainPage.html?username=${username}`;
}