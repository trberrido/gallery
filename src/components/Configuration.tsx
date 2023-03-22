import { useReducer, useState, useEffect } from 'react';

import Image from './Image';
import { useGlobalContext } from '../Context';

import './Configuration.css';
import { resolveModuleNameFromCache } from 'typescript';

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

	const resize = () => {
		console.log(window.innerWidth)
		var h = window.innerHeight;
		do {
			var dimensions = state.dimensions.map((d) => ({ w: Math.ceil(h * d.w / d.h), h: h}))
			var {nbRow, width} = dimensions.reduce((acc, curr) => {
				var nextAcc = {
					width: acc.width + curr.w,
					nbRow: acc.nbRow
				}
				if (nextAcc.width >= window.innerWidth * .9){
					nextAcc.width = 0;
					nextAcc.nbRow += 1;
				}
				return nextAcc;
			}, {nbRow: 1, width: 0})
			h -= 1;
			if (index === 2)
				console.log('@', nbRow)
		} while (nbRow * h > window.innerHeight)
		return h;
	}

	useEffect(() => {
		if (isComplete === true){
			console.log('index done', index)
			setHeight(resize());
		}
	}, [isComplete])

	useEffect(() => {

		const handleResize = () => {
			setHeight(resize());
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);

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