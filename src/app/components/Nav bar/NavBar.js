import React from 'react';

function NavBar() {
    return (
        <nav className='shadow'>
            <h1 className='p-3 m-0 w-auto'>
                <a href='/' className='nav-link text-light'>
                    <span role="img" aria-label='pelota' className='fst-italic'>⚽ </span>
                    <span className='nav-link-title'>FulboLista</span>
                    <span className='fs-5 fst-italic'> beta</span>
                </a>
            </h1>
        </nav>
    )
}

export default NavBar;