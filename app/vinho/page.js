'use client';
import {useEffect,useState} from 'react';
import WineDetail from '../WineDetail';
import {wineIdFromSlug} from '../catalogLoader';
export default function WinePage(){const [id,setId]=useState('');useEffect(()=>setId(wineIdFromSlug(new URLSearchParams(location.search).get('produto')||'')),[]);return <WineDetail id={id}/>}
