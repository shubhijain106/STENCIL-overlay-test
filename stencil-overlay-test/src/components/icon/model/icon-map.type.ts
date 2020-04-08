import { IconType } from './icon.type';

export type IconMapType = {
	[key in IconType]: {
		path?: string;
		svg?: string;
		viewBox?: string;
		transform?: string;
	};
};
