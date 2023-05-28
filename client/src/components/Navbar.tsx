import { useAuth } from '../hooks/auth.hook'
import '../styles/navbar.css'

function Navbar() {
    const {logout} = useAuth()
    return (
        <div className='navbar'>
            <div>
                <a 
                    className='my-contacts-link'
                    href="/"
                >
                    <svg id='my-contacts-icon' xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 50 50" version="1.1">
                        <defs>
                            <path d="M0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 38.8071 38.8071 50 25 50C11.1929 50 0 38.8071 0 25Z" id="path_1"/>
                            <clipPath id="mask_1">
                            <use xlinkHref="#path_1"/>
                            </clipPath>
                        </defs>
                        <g id="Овал-2-+-Овал-5-Маска">
                            <path d="M0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 38.8071 38.8071 50 25 50C11.1929 50 0 38.8071 0 25Z" id="Маска" fill="#444444" fillRule="evenodd" stroke="none"/>
                            <g clipPath="url(#mask_1)">
                                <path d="M17 20C17 15.5817 20.5817 12 25 12C29.4183 12 33 15.5817 33 20C33 24.4183 29.4183 28 25 28C20.5817 28 17 24.4183 17 20Z" id="Овал-2" fill="#D3D3D3" fillRule="evenodd" stroke="none"/>
                                <path d="M9 46C9 37.1634 16.1634 30 25 30C33.8366 30 41 37.1634 41 46C41 54.8366 33.8366 62 25 62C16.1634 62 9 54.8366 9 46Z" id="Овал-5" fill="#D3D3D3" fillRule="evenodd" stroke="none"/>
                            </g>
                        </g>
                    </svg>
                    <h1>myContacts</h1>
                </a>
                <a 
                    className='logout-link'
                    href='/'
                    onClick={logout}
                    >Выйти</a>
            </div>
        </div>
    )
}
export {Navbar}