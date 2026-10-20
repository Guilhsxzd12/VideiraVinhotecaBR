export default function SensoryIcon({kind}){
 const paths={
  Visual:<><path d="M3 24s10-13 25-13 25 13 25 13-10 13-25 13S3 24 3 24Z"/><circle cx="28" cy="24" r="9"/></>,
  Aromas:<path d="M32 5 15 34c-3 5-2 8 3 9 6 2 10-3 14-3 3 0 4 3 8 3 5 0 8-4 7-8-1-4-5-5-8-3"/>,
  Paladar:<><path d="M3 25c7-4 12-14 20-11l5 2 5-2c8-3 13 7 20 11-8 9-15 13-25 13S11 34 3 25Z"/><path d="M3 25c8 1 15-2 25 0 10-2 17 1 25 0"/></>,
 };
 if(!paths[kind])return null;
 return <svg className="pd-sensory-icon" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[kind]}</svg>;
}
