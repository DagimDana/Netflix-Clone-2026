import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__contact">Questions? Call 1-800-742-3094</p>
        <div className="footer__links">
          <div className="footer__column">
            <a href="#" className="footer__link">FAQ</a>
            <a href="#" className="footer__link">Investor Relations</a>
            <a href="#" className="footer__link">Privacy</a>
            <a href="#" className="footer__link">Speed Test</a>
          </div>
          <div className="footer__column">
            <a href="#" className="footer__link">Help Center</a>
            <a href="#" className="footer__link">Jobs</a>
            <a href="#" className="footer__link">Cookie Preferences</a>
            <a href="#" className="footer__link">Legal Notices</a>
          </div>
          <div className="footer__column">
            <a href="#" className="footer__link">Account</a>
            <a href="#" className="footer__link">Ways to Watch</a>
            <a href="#" className="footer__link">Corporate Information</a>
            <a href="#" className="footer__link">Only on Netflix</a>
          </div>
          <div className="footer__column">
            <a href="#" className="footer__link">Media Center</a>
            <a href="#" className="footer__link">Terms of Use</a>
            <a href="#" className="footer__link">Contact Us</a>
          </div>
        </div>
        <div className="footer__language">
          <button className="footer__language-btn">
            <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
              <path d="M8 0C3.589 0 0 3.589 0 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14.5C4.416 14.5 1.5 11.584 1.5 8S4.416 1.5 8 1.5 14.5 4.416 14.5 8 11.584 14.5 8 14.5zm0-12C5.243 2.5 3 4.743 3 7.5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8.5C6.619 11 5.5 9.881 5.5 8.5S6.619 6 8 6s2.5 1.119 2.5 2.5S9.381 11 8 11z" />
            </svg>
            English
          </button>
        </div>
        <p className="footer__copyright">Netflix &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default Footer
