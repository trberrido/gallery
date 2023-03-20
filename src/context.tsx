import React, { createContext, useContext, useEffect, useReducer, useState } from "react";

const initialHeight = window.innerHeight;
const HeightContext = createContext(initialHeight);

const initialConfiguration = 0;
const CurrentConfigurationContext = createContext(initialConfiguration);

type DataState = {
	isLoaded: boolean,
	loadedImages: number,
	configurations: null | string[][]
}

type DataStateFetched = {
	isLoaded: boolean,
	configurations: string[][]
}

type Action = {
	type: 'imageLoaded' | 'dataFetched' | '',
	payload?: DataStateFetched
}

const initialDataState = {
	isLoaded: false,
	loadedImages: 0,
	configurations: null
};

const DataContext = createContext<{
	data: DataState,
	dispatch: React.Dispatch<Action>
}>({data: initialDataState, dispatch: () => {}});

type Props = {
	children: React.ReactNode
}

const dataReducer = (state: DataState, action: Action):DataState => {
	switch (action.type){
		case 'imageLoaded':
			return ({
				...state,
				loadedImages: state.loadedImages + 1
			});
		case 'dataFetched':
			return ({
				...state,
				...action.payload
			});
		default:
			return state;
	}
}

const ContextsProvider = ({children}: Props)  => {

	const [imageHeight, setImageHeight] = useState(initialHeight);
	const [currentConfiguration, setCurrentConfiguration] = useState(initialConfiguration);
	const [data, dispatch] = useReducer(dataReducer, initialDataState);

	// Fetch data
	useEffect(() => {
		fetch('https://' + window.location.hostname + '/api/')
		.then(res => res.json())
		.then(
			(result) => {
				dispatch({
					type: 'dataFetched',
					payload: {
						isLoaded: true,
						configurations: result
					}
				});
			}
		);
	}, []);

	// switch next / previous configuration
	useEffect(() =>{

		const handleKeyUp = (e: KeyboardEvent) => {

			let nextConfiguration = currentConfiguration;

			if (e.code === 'ArrowLeft')
				nextConfiguration -=1;
			if (e.code === 'ArrowRight')
				nextConfiguration += 1;

			if (nextConfiguration < 0)
				nextConfiguration = data.configurations!.length - 1;
			if (nextConfiguration === data.configurations!.length)
				nextConfiguration = 0;

			setCurrentConfiguration(nextConfiguration);

		};

		window.addEventListener('keyup', handleKeyUp);
		return () => window.removeEventListener('keyup', handleKeyUp);

	}, [currentConfiguration, data])

	// window resize
	useEffect(() => {

		const handleResize = () => {
			setImageHeight(window.innerHeight);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);

	}, []);

	return (
		<HeightContext.Provider value={ imageHeight }>
			<CurrentConfigurationContext.Provider value={ currentConfiguration }>
				<DataContext.Provider value={{ data, dispatch }} >
					{ children }
				</DataContext.Provider>
			</CurrentConfigurationContext.Provider>
		</HeightContext.Provider>
	);

}

export const useHeightContext = () => useContext(HeightContext);
export const useCurrentConfigurationContext = () => useContext(CurrentConfigurationContext);
export const useDataContext = () => useContext(DataContext);

export default ContextsProvider;