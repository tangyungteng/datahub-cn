/**
 * Maps the hard-coded English entity tab names (used for routing as `tab.name`)
 * to i18n keys under the `entity_tabs` node of the `common` namespace.
 *
 * IMPORTANT: The tab `name` field doubles as the URL path segment and routing key
 * (see `useRoutedTab` / `getEntityPath`). Therefore tabs must keep their original
 * English `name`/`key`, and translation must only be applied to the DISPLAYED label
 * at the render layer.
 */
const TAB_NAME_TO_I18N_KEY: Record<string, string> = {
    Summary: 'summary',
    Columns: 'columns',
    'View Definition': 'view_definition',
    Documentation: 'documentation',
    Preview: 'preview',
    Lineage: 'lineage',
    Access: 'access',
    Properties: 'properties',
    Queries: 'queries',
    Stats: 'stats',
    Quality: 'quality',
    Governance: 'governance',
    Runs: 'runs',
    Incidents: 'incidents',
    Fields: 'fields',
    Dashboards: 'dashboards',
    Contents: 'contents',
    Datasets: 'datasets',
    Tasks: 'tasks',
    Pipeline: 'pipeline',
    Entities: 'entities',
    'Data Products': 'data_products',
    'Related Terms': 'related_terms',
    'Related Entities': 'related_entities',
    'Related Assets': 'related_assets',
    Assets: 'assets',
    Schema: 'schema',
    'Feature Tables': 'feature_tables',
    Features: 'features',
    Sources: 'sources',
    Models: 'models',
    Group: 'group',
};

/**
 * Returns the translated display label for an entity tab name.
 * Falls back to the original name when no translation key is registered
 * (e.g. dynamically rendered aspect tabs).
 *
 * @param name The original English tab name.
 * @param t A `t` function bound to the `common` namespace.
 */
export function translateEntityTabName(name: string, t: (key: string) => string): string {
    const key = TAB_NAME_TO_I18N_KEY[name];
    return key ? t(`entity_tabs.${key}`) : name;
}
