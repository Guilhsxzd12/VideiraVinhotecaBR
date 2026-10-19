'use client';
import {useParams} from 'next/navigation';
import WineDetail from '../WineDetail';
export default function SlugPage(){const {slug}=useParams();return <WineDetail slug={String(slug||'')}/>}
