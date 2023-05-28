import { Link } from 'react-router-dom'
import '../styles/pages/notfound-page.css'
import '../styles/pages/authNNotfound-pages.css'

export function NotFoundPage() {
    return (
        <div className="notfound-wrapper">
            <div className="notfound-content-wrapper">
                <h1>myContacts</h1>
                <h2>Страница не найдена</h2>
                <div>
                    <svg className="logo" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="300px" height="300px" viewBox="0 0 300 300" version="1.1">
                        <defs>
                            <path d="M0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150Z" id="path_1"/>
                            <clipPath id="oval_1">
                                <use xlinkHref="#path_1"/>
                            </clipPath>
                        </defs>
                        <g id="oval-2-+-oval-3-mask">
                            <path d="M0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150Z" id="oval-1" fillRule="evenodd" stroke="none"/>
                            <g clipPath="url(#oval_1)">
                                <path d="M102 114C102 87.4903 123.49 66 150 66C176.51 66 198 87.4903 198 114C198 140.51 176.51 162 150 162C123.49 162 102 140.51 102 114Z" id="oval-2" fillRule="evenodd" stroke="none"/>
                                <path d="M54 276C54 222.981 96.9807 180 150 180C203.019 180 246 222.981 246 276C246 329.019 203.019 372 150 372C96.9807 372 54 329.019 54 276Z" id="oval-3" fillRule="evenodd" stroke="none"/>
                            </g>
                        </g>
                    </svg>
                    <div>
                        <span className="notfound-code">404</span>
                        <Link to="/" className="notfound-redirect">Перейти на главную страницу</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}