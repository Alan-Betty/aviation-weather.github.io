import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    GithubAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//! Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const githubProvider = new GithubAuthProvider();

//! Function to handle social media login with account linking
async function handleSocialMediaLogin(provider) {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('User logged in:', result.user);
        alert('Login successful!');
        window.location.href = "index.html";
    } catch (error) {
        if (error.code === 'auth/account-exists-with-different-credential') {
            const email = error.customData.email;
            let pendingCredential;
            if (provider instanceof GoogleAuthProvider) {
                pendingCredential = GoogleAuthProvider.credentialFromError(error);
            } else if (provider instanceof FacebookAuthProvider) {
                pendingCredential = FacebookAuthProvider.credentialFromError(error);
            } else if (provider instanceof GithubAuthProvider) {
                pendingCredential = GithubAuthProvider.credentialFromError(error);
            } else if (provider instanceof OAuthProvider) {
                pendingCredential = OAuthProvider.credentialFromError(error);
            }
            if (provider.providerId === 'github.com') {
                try {
                    const methods = await fetchSignInMethodsForEmail(auth, email);
                    if (methods.includes('github.com')) {
                        const githubResult = await signInWithPopup(auth, githubProvider);
                        alert('GitHub sign in successful!');
                        window.location.href = "index.html";
                    } else {
                        const emailParts = email.split('@');
                        const aliasEmail = `${emailParts[0]}+${provider.providerId}-${Date.now()}@${emailParts[1]}`;
                        const randomPassword = Math.random().toString(36).slice(-8);
                        const registrationResult = await createUserWithEmailAndPassword(auth, aliasEmail, randomPassword);
                        console.log('Alias account registered:', registrationResult.user);
                        window.location.href = "index.html";
                    }
                } catch (githubError) {
                    console.error('GitHub sign-in error:', githubError);
                    alert(`GitHub error: ${githubError.message}`);
                }
            } else {
                const emailParts = email.split('@');
                const aliasEmail = `${emailParts[0]}+${provider.providerId}-${Date.now()}@${emailParts[1]}`;
                const randomPassword = Math.random().toString(36).slice(-8); // simple random password
                try {
                    const registrationResult = await createUserWithEmailAndPassword(auth, aliasEmail, randomPassword);
                    console.log('Alias account registered:', registrationResult.user);
                    window.location.href = "index.html";
                } catch (creationError) {
                    console.error('Error during alias registration:', creationError);
                    alert(`Registration failed: ${creationError.message}`);
                }
            }
        } else {
            console.error('Social media login error:', error);
            alert(`Login failed: ${error.message}`);
        }
    }
}

// Attach social media login functions to window
window.signInWithGoogle = () => handleSocialMediaLogin(googleProvider);
window.signInWithFacebook = () => handleSocialMediaLogin(facebookProvider);
window.signInWithMicrosoft = () => handleSocialMediaLogin(microsoftProvider);
window.signInWithGithub = () => handleSocialMediaLogin(githubProvider);

//!! Login-Register Switcher
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const loginForm = document.querySelector('.form-box.login');
const registerForm = document.querySelector('.form-box.register');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
    loginForm.style.visibility = 'hidden'; // Hide login form
    registerForm.style.visibility = 'visible'; // Show register form
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    loginForm.style.visibility = 'visible'; // Show login form
    registerForm.style.visibility = 'hidden'; // Hide register form
});

//!! Email Registration/Login
const registerFormElement = document.querySelector('.form-box.register form');
const loginFormElement = document.querySelector('.form-box.login form');

// ! email registration
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerFormElement.querySelector('input[type="email"]').value;
    const password = registerFormElement.querySelector('input[type="password"]').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered:', userCredential.user);
        alert('Registration successful! Logging you in...');
        window.location.href = "index.html";
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
});

//! email login
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginFormElement.querySelector('input[type="text"]').value; // Assuming email is entered in the "Username" field
    const password = loginFormElement.querySelector('input[type="password"]').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
        alert('Login successful!');
        window.location.href = "index.html";
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
});


