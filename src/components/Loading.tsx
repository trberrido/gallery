import spinner from '../assets/spinner.svg';
import './Loading.css';

type Props = {
	percent: number
}

const Loading = ({percent}: Props) => {

	return (
		<>
			<div
				style={{ backgroundImage: `url(${spinner})` }}
				className='loading__background'>
					<p className='loading__percent'>
						{Math.floor(percent)}%
					</p>
			</div>
		</>
	);
}

export default Loading;