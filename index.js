import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let manualLogout = false; // global flag for manual logout

onAuthStateChanged(auth, (user) => {
    if (!user) {
        document.body.classList.add("blur");
        // Wait a bit to allow the blur to render before showing the alert.
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (!manualLogout) {
                    alert("Please log in.");
                }
                window.location.href = "login-register.html";
            }, 100); // 100ms delay
        });
    } else {
        document.body.classList.remove("blur");
    }
});

//!! Underline
const navbar = document.querySelector(".navbar");
const underline = document.querySelector(".underline");
const links = document.querySelectorAll(".navbar a");

function moveUnderline(link) {
	const { left, width } = link.getBoundingClientRect();
	const offsetLeft = left - navbar.getBoundingClientRect().left;

	gsap.to(underline, {
		x: offsetLeft,
		width: width + 10, // length of the underline
		backgroundColor: "white",
		boxShadow: "0 0 15px white, 0 0 30px white",
		duration: 0.6,
		ease: "power2.out"
	});
}


//!! links
links.forEach(link => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		links.forEach(l => l.classList.remove("active"));
		e.target.classList.add("active");
		moveUnderline(e.target);
		underline.style.visibility = "visible";
	});
});

//# Wait for layout to finish before moving underline
window.addEventListener('load', () => {
	links[0].classList.add("active");
	moveUnderline(links[0]);
	underline.style.visibility = "visible";
});

//! Smooth scrolling for navigation links
links.forEach(link => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const targetId = link.getAttribute("href").substring(1);
		const targetSection = document.getElementById(targetId);

		if (targetSection) {
			targetSection.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}
	});
});

//!! Metar Taf Search via ICAO code.

async function getAviationWeather() {
	const icaoInput = document.getElementById("icao");
	const icao = icaoInput.value.toUpperCase().trim();
	icaoInput.value = icao; // Ensure input is uppercase
	const results = document.getElementById("results");
	results.textContent = "Fetching METAR and TAF...";

	const format = document.querySelector('input[name="format"]:checked').value;

	try {
		const [metarRes, tafRes] = await Promise.all([
			fetch(`https://avwx.rest/api/metar/${icao}?token=${token}`),
			fetch(`https://avwx.rest/api/taf/${icao}?token=${token}`)
		]);

		if (!metarRes.ok || !tafRes.ok) {
			throw new Error("Invalid ICAO code or API issue");
		}

		const metarData = await metarRes.json();
		const tafData = await tafRes.json();

		if (format === "raw") {
			results.innerHTML = `
<b>ICAO:</b> ${icao}<br><br>
<b>METAR (Raw):</b><br>${metarData.raw}<br><br>
<b>TAF (Raw):</b><br>${tafData.raw}
			`;
		} else if (format === "decoded") {
			results.innerHTML = `
<b>ICAO:</b> ${icao}<br><br>
<b>METAR (Decoded):</b><br>${JSON.stringify(metarData, null, 2)}<br><br>
<b>TAF (Decoded):</b><br>${JSON.stringify(tafData, null, 2)}
			`;
		}
	} catch (err) {
		results.textContent = `Error: ${err.message}`;
	}
}

function logout() {
    manualLogout = true;
    signOut(auth)
        .then(() => {
            alert("You have been logged out.");
            window.location.href = "login-register.html";
        })
        .catch(error => {
            console.error("Logout error:", error);
            alert("Failed to log out. Please try again.");
        });
}

// Attach logout to the global window object
window.logout = logout;
