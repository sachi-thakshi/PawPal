// Simulate user data
  const user = {
    name: "Alex", // fallback name
    avatarUrl: null // or provide URL like "/images/alex.jpg"
  };

  const avatarContainer = document.getElementById("user-avatar");

  if (user.avatarUrl) {
    // Create <img> tag if avatar exists
    const img = document.createElement("img");
    img.src = user.avatarUrl;
    img.alt = "User Avatar";
    img.className = "rounded-circle";
    img.width = 36;
    img.height = 36;
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(img);
  } else {
    // Show first initial
    const initial = user.name ? user.name.charAt(0) : "?";
    avatarContainer.textContent = initial;
}

// Sample pet data
        const pets = [
            {
                id: 1,
                name: "Buddy",
                type: "dog",
                breed: "Golden Retriever",
                age: "adult",
                location: "colombo",
                coordinates: { lat: 6.9271, lng: 79.8612 },
                image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=250&fit=crop",
                description: "Friendly and energetic golden retriever looking for an active family.",
                shelter: "Colombo Animal Shelter"
            },
            {
                id: 2,
                name: "Whiskers",
                type: "cat",
                breed: "Persian",
                age: "young",
                location: "kandy",
                coordinates: { lat: 7.2906, lng: 80.6337 },
                image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=250&fit=crop",
                description: "Beautiful Persian cat with stunning blue eyes. Very calm and loving.",
                shelter: "Kandy Pet Care Center"
            },
            {
                id: 3,
                name: "Charlie",
                type: "dog",
                breed: "Labrador",
                age: "puppy",
                location: "galle",
                coordinates: { lat: 6.0329, lng: 80.217 },
                image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=250&fit=crop",
                description: "Playful Labrador puppy who loves to fetch and swim.",
                shelter: "Galle Animal Rescue"
            },
            {
                id: 4,
                name: "Luna",
                type: "cat",
                breed: "Siamese",
                age: "adult",
                location: "negombo",
                coordinates: { lat: 7.2083, lng: 79.8358 },
                image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=250&fit=crop",
                description: "Elegant Siamese cat with striking blue eyes. Independent but affectionate.",
                shelter: "Negombo Pet Haven"
            },
            {
                id: 5,
                name: "Max",
                type: "dog",
                breed: "German Shepherd",
                age: "adult",
                location: "colombo",
                coordinates: { lat: 6.9344, lng: 79.8428 },
                image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=250&fit=crop",
                description: "Loyal German Shepherd, great with kids and perfect guard dog.",
                shelter: "Colombo Animal Shelter"
            },
            {
                id: 6,
                name: "Bella",
                type: "rabbit",
                breed: "Holland Lop",
                age: "young",
                location: "kandy",
                coordinates: { lat: 7.2833, lng: 80.6167 },
                image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=250&fit=crop",
                description: "Adorable Holland Lop rabbit with soft fur and gentle nature.",
                shelter: "Kandy Small Animal Rescue"
            }
        ];

        let map;
        let markers = [];
        let filteredPets = [...pets];

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            displayPets(pets);
            initMap();
        });

        // Display pets function
        function displayPets(petsToShow) {
            const container = document.getElementById('petContainer');
            container.innerHTML = '';

            petsToShow.forEach(pet => {
                const petCard = `
                    <div class="col-lg-4 col-md-6 pet-card-container" data-type="${pet.type}" data-age="${pet.age}" data-location="${pet.location}">
                        <div class="pet-card">
                            <img src="${pet.image}" alt="${pet.name}" class="pet-image">
                            <div class="pet-info">
                                <div class="pet-name">${pet.name}</div>
                                <div class="pet-details">
                                    <span class="badge badge-custom me-2">${pet.breed}</span>
                                    <span class="badge badge-custom me-2">${capitalizeFirst(pet.age)}</span>
                                    <span class="badge badge-custom">${capitalizeFirst(pet.location)}</span>
                                </div>
                                <p class="mt-2 text-muted">${pet.description}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <button class="btn adopt-btn" onclick="showPetDetails(${pet.id})">
                                        <i class="fas fa-heart me-2"></i>Learn More
                                    </button>
                                    <button class="btn location-btn" onclick="showPetOnMap(${pet.id})">
                                        <i class="fas fa-map-marker-alt me-2"></i>View Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += petCard;
            });
        }

        // Initialize Google Map
        function initMap() {
            // Center map on Sri Lanka
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: { lat: 7.8731, lng: 80.7718 },
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // Add markers for each pet
            addMarkersToMap(pets);
        }

        // Add markers to map
        function addMarkersToMap(petsToShow) {
            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            markers = [];

            petsToShow.forEach(pet => {
                const marker = new google.maps.Marker({
                    position: pet.coordinates,
                    map: map,
                    title: pet.name,
                    icon: {
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0z" fill="#ff6b6b"/>
                                <circle cx="15" cy="15" r="8" fill="white"/>
                                <text x="15" y="19" text-anchor="middle" font-size="12" fill="#ff6b6b">🐾</text>
                            </svg>
                        `)}`,
                        scaledSize: new google.maps.Size(30, 40)
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="max-width: 200px;">
                            <img src="${pet.image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                            <h6 style="margin: 0; color: #2c3e50;">${pet.name}</h6>
                            <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">${pet.breed} • ${capitalizeFirst(pet.age)}</p>
                            <p style="margin: 5px 0; color: #666; font-size: 0.8rem;">${pet.shelter}</p>
                            <button onclick="showPetDetails(${pet.id})" style="background: #ff6b6b; color: white; border: none; padding: 5px 15px; border-radius: 15px; font-size: 0.8rem; margin-top: 5px;">
                                Learn More
                            </button>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                markers.push(marker);
            });
        }

        // Filter pets function
        function filterPets() {
            const typeFilter = document.getElementById('typeFilter').value;
            const ageFilter = document.getElementById('ageFilter').value;
            const locationFilter = document.getElementById('locationFilter').value;

            filteredPets = pets.filter(pet => {
                return (!typeFilter || pet.type === typeFilter) &&
                       (!ageFilter || pet.age === ageFilter) &&
                       (!locationFilter || pet.location === locationFilter);
            });

            displayPets(filteredPets);
            addMarkersToMap(filteredPets);
        }

        // Show pet on map
        function showPetOnMap(petId) {
            const pet = pets.find(p => p.id === petId);
            if (pet) {
                map.setCenter(pet.coordinates);
                map.setZoom(15);
                
                // Find and click the marker
                const marker = markers.find(m => m.getTitle() === pet.name);
                if (marker) {
                    google.maps.event.trigger(marker, 'click');
                }
                
                // Scroll to map section
                scrollToSection('map-section');
            }
        }

        // Show pet details in modal
        function showPetDetails(petId) {
            const pet = pets.find(p => p.id === petId);
            if (pet) {
                document.getElementById('modalPetName').textContent = pet.name;
                document.getElementById('modalBody').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${pet.image}" class="img-fluid rounded mb-3" alt="${pet.name}">
                        </div>
                        <div class="col-md-6">
                            <h5>About ${pet.name}</h5>
                            <p><strong>Breed:</strong> ${pet.breed}</p>
                            <p><strong>Age:</strong> ${capitalizeFirst(pet.age)}</p>
                            <p><strong>Location:</strong> ${capitalizeFirst(pet.location)}</p>
                            <p><strong>Shelter:</strong> ${pet.shelter}</p>
                            <p><strong>Description:</strong> ${pet.description}</p>
                            
                            <div class="mt-4">
                                <h6>Contact Information:</h6>
                                <p><i class="fas fa-phone me-2"></i>+94 11 234 5678</p>
                                <p><i class="fas fa-envelope me-2"></i>adopt@pawfinder.lk</p>
                                <p><i class="fas fa-clock me-2"></i>Visit Hours: 9 AM - 6 PM</p>
                            </div>
                        </div>
                    </div>
                `;
                
                const modal = new bootstrap.Modal(document.getElementById('petModal'));
                modal.show();
            }
        }

        // Utility functions
        function capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }

        // // Add some floating hearts animation
        // function createFloatingHeart() {
        //     const heart = document.createElement('div');
        //     heart.innerHTML = '❤️';
        //     heart.className = 'floating-heart';
        //     heart.style.left = Math.random() * 100 + 'vw';
        //     heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
        //     document.body.appendChild(heart);
            
        //     setTimeout(() => {
        //         heart.remove();
        //     }, 5000);
        // }

        // // Create floating hearts periodically
        // setInterval(createFloatingHeart, 3000);


    document.getElementById('adoptBtn').addEventListener('click', function () {
        // Show initial request sent alert
        Swal.fire({
            icon: 'success',
            title: 'Request Sent',
            text: 'Your adoption request has been sent to the admin!',
        });

        // Simulate admin approval after delay (replace with real event or backend signal)
        setTimeout(() => {
            // Sample pet data
            const petDetails = {
                name: 'Buddy',
                breed: 'Golden Retriever',
                age: '2 years',
                gender: 'Male'
            };

            Swal.fire({
                icon: 'success',
                title: 'Request Approved!',
                html: `
                    <strong>Pet Name:</strong> ${petDetails.name}<br>
                    <strong>Breed:</strong> ${petDetails.breed}<br>
                    <strong>Age:</strong> ${petDetails.age}<br>
                    <strong>Gender:</strong> ${petDetails.gender}
                `
            });
        }, 4000); // Simulate admin response in 4 seconds
    });