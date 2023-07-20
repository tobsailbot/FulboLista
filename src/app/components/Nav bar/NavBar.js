import React from 'react';

function NavBar() {
    return (
        <nav>
            <a href='/' className='nav-link text-light'>
                <h1 className='p-3 m-0'>
                    <span role="img" aria-label='pelota' className='fst-italic'>⚽ </span>
                    <span className='nav-link-title'>FulboLista</span>
                    <span className='fs-5 fst-italic'> beta</span>
                </h1>
            </a>
        </nav>
    )
}

export default NavBar;