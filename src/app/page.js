import React from 'react';
import CrearPartido from './components/Crear Partido/CrearPartido';
import UnirsePartido from './components/Unirse Partido/UnirsePartido';

function Page() {

	return (
		<div>
			<div className='container p-5 mt-5 mb-4'>
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
