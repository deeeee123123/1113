import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const gate = document.querySelector("#authGate");
const planner = document.querySelector("#plannerApp");
const message = document.querySelector("#authMessage");
const login = document.querySelector("#googleLogin");
const logout = document.querySelector("#logout");
const userLabel = document.querySelector("#userLabel");

function updateAuthState(user) {
  const nextUser = user || null;
  const previousUid = window.firebaseAuthUser?.uid || null;
  const nextUid = nextUser?.uid || null;
  window.firebaseAuthUser = nextUser;
  if (previousUid !== nextUid) window.dispatchEvent(new Event("firebase-user-ready"));
  const signedIn = !!nextUser;
  gate.hidden = signedIn;
  planner.hidden = !signedIn;
  login.hidden = signedIn;
  login.disabled = false;
  if (nextUser) {
    userLabel.textContent = nextUser.displayName || nextUser.email || "個人空間";
    message.textContent = "";
  }
}

function showError(error) {
  const messages = {
    "auth/unauthorized-domain": "此網域尚未加入 Firebase 授權網域，請在 Authentication → 設定中加入 deeeee123123.github.io。",
    "auth/popup-blocked": "登入視窗遭瀏覽器封鎖，請允許此網站開啟彈出視窗後重試。",
    "auth/popup-closed-by-user": "登入視窗已關閉，請重新點選登入。",
    "auth/operation-not-allowed": "Firebase 尚未啟用 Google 登入，請在 Authentication → 登入方式啟用 Google。",
    "auth/unauthorized-continue-uri": "目前登入網址未獲授權，請確認已將 deeeee123123.github.io 加入 Firebase Authentication 的授權網域。",
    "auth/network-request-failed": "無法連線至 Firebase，請檢查網路或瀏覽器是否封鎖驗證要求，再重試。"
  };
  message.textContent = messages[error.code] || `登入失敗（${error.code || "未知錯誤"}），請確認 Firebase 設定後重試。`;
}

try {
  if (!window.FIREBASE_CONFIG) throw new Error("尚未設定 Firebase Web App 設定值。");
  if (location.protocol !== "https:" && location.hostname !== "localhost") throw new Error("請透過 GitHub Pages HTTPS 網址開啟網站，再使用 Google 登入。");
  const app = initializeApp(window.FIREBASE_CONFIG);
  const auth = getAuth(app);
  auth.useDeviceLanguage();
  logout.addEventListener("click", () => signOut(auth).catch(showError));
  login.addEventListener("click", async () => {
    message.textContent = "正在開啟 Google 登入…";
    login.disabled = true;
    const timeout = setTimeout(() => {
      if (login.disabled) {
        login.disabled = false;
        message.textContent = "登入逾時或登入視窗未完成驗證。請允許彈出視窗後重試。";
      }
    }, 15000);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      clearTimeout(timeout);
      updateAuthState(result.user);
    }
    catch (error) { clearTimeout(timeout); showError(error); login.disabled = false; }
  });
  onAuthStateChanged(auth, updateAuthState, showError);
} catch (error) {
  message.textContent = error.message;
  login.disabled = true;
}

