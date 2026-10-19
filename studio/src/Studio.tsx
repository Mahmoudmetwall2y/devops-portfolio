import { Studio } from 'sanity';
import { studioConfig } from '../sanity.config';
export default function ConnectedStudio() { return <Studio config={studioConfig} scheme="dark" />; }
