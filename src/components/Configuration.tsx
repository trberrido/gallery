import { useReducer, useState, useEffect } from 'react';

import Image from './Image';
import { useGlobalContext } from '../Context';

import './Configuration.css';

type dimensions = {w: number; h: number; }

type State = {
	loaded: number;
	data: string[];
	dimensions: dimensions[];
	setIsComplete: React.Dispatch<React.SetStateAction<boolean>>
}

type Action = {
	type: 'loaded';
	payload: dimensions;
}

const reducer = (state: State, action: Action):State => {
	if (action.type === 'loaded'){
		const loaded = state.loaded + 1;
		const dimensions = structuredClone(state.dimensions);
		dimensions.push(action.payload);
		if (loaded === state.data?.length)
			state.setIsComplete(true);
		return ({...state,
			loaded: loaded,
			dimensions: dimensions
		})
	}
	return (state);
}

type ConfigurationProps = {
	images: string[];
	index: number;
}

const Configuration = ({images, index}: ConfigurationProps) => {

	const {globalState, globalDispatch} = useGlobalContext();
	const display = globalState.currentConfiguration === index;

	const [isComplete, setIsComplete] = useState(false);
	const initialState:State = {
		loaded: 0,
		data: images,
		dimensions:[],
		setIsComplete: setIsComplete
	}
	const [state, dispatch] = useReducer(reducer, initialState);
	const [height, setHeight] = useState(window.innerHeight);

	const handleLoading = (e:React.SyntheticEvent<HTMLImageElement, Event>) => {
		dispatch({
			type: 'loaded',
			payload: {
				w: e.currentTarget.width,
				h: e.currentTarget.height,
			}
		})
		globalDispatch({
			type: 'increment',
			payload: { field: 'loaded'}
		})
	}

	const fitResize = () => {
		let newHeight = window.innerHeight;
		do {
			let safeHeight = newHeight;
			let dimensions = state.dimensions.map((d) => ({ w: Math.ceil(safeHeight * d.w / d.h), h: safeHeight}))
			var {nbRows} = dimensions.reduce((acc, curr) => {
				let nextAcc = {
					width: acc.width + curr.w,
					nbRows: acc.nbRows
				}
				if (nextAcc.width >= window.innerWidth * .9){
					nextAcc.width = 0;
					nextAcc.nbRows += 1;
				}
				return nextAcc;
			}, {nbRows: 1, width: 0})
			newHeight -= 1;
		} while (nbRows * newHeight > window.innerHeight)
		return newHeight;
	}

	useEffect(() => {
		if (isComplete === true){
			setHeight(fitResize());
		}
		// eslint-disable-next-line
	}, [isComplete])

	useEffect(() => {

		const handleResize = () => {
			setHeight(fitResize());
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
		// eslint-disable-next-line
	}, [state.dimensions]);

	return (
		<div className={'configuration configuration' + (display && isComplete ? '--visible' : '--hidden')}>
			{
				images.map((image) => (
					<Image
						height={height}
						handleLoading={handleLoading}
						key={image}
						src={image} />
				))
			}
		</div>
	);
}

export default Configuration;