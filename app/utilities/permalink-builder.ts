import * as Types from '../types/primo'
interface PermalinkConfig {
    baseUrl: string;
    institutionCode: string;
    defaultTab: string;
}

const UCSD_CONFIG: PermalinkConfig = {
    baseUrl: 'https://search-library.ucsd.edu',
    institutionCode: '01UCS_SDI',
    defaultTab: 'ld412s'
};

export function getPrimoPermalink(
    doc: Types.PrimoDoc,
    config: PermalinkConfig = UCSD_CONFIG,
    tabCode?: string
): string {
    const recordId = doc.pnx.control.recordid?.[0];

    if (!recordId) {
        return 'No record ID found';
    }

    const tab = tabCode || config.defaultTab;

    return `${config.baseUrl}/permalink/${config.institutionCode}/${tab}/${recordId}`;
}