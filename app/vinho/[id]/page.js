'use client';
import {useParams} from 'next/navigation';
import WineDetail from '../../WineDetail';
import {wineIdFromSlug} from '../../catalogLoader';
export default function WinePage(){const params=useParams();return <WineDetail id={wineIdFromSlug(params?.id||'')}/>}
