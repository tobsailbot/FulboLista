import React from 'react';
import CrearPartido from './components/Crear Partido/CrearPartido';
import PartidoComponent from './components/Partido Component/PartidoComponent';
import UnirsePartido from './components/Unirse Partido/UnirsePartido';
import NavBar from './components/Nav bar/NavBar';


function Page() {

	return (
		<div>
			<NavBar />
			<div className='container p-5 mt-5'>
				<CrearPartido />
				<br />
				<br />
				<div className='border border-2'></div>
				<br />
				<br />
				<UnirsePartido />
			</div>
		</div>
	);
}

export default Page;
