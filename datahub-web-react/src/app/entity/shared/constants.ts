import { EntityType } from '@types';

// TODO(Gabe): integrate this w/ the theme
export const REDESIGN_COLORS = {
    GREY: '#e5e5e5',
    BLUE: '#1890FF',
};

export const ANTD_GRAY = {
    1: '#FFFFFF',
    2: '#FAFAFA',
    2.5: '#F8F8F8',
    3: '#F5F5F5',
    4: '#F0F0F0',
    4.5: '#E9E9E9',
    5: '#D9D9D9',
    6: '#BFBFBF',
    7: '#8C8C8C',
    8: '#595959',
    9: '#434343',
};

export const ANTD_GRAY_V2 = {
    1: '#F8F9Fa',
    2: '#F3F5F6',
    5: '#DDE0E4',
    6: '#B2B8BD',
    8: '#5E666E',
    10: '#1B1E22',
};

export const EMPTY_MESSAGES = {
    documentation: {
        title: 'entity:empty.documentation_title',
        description: 'entity:empty.documentation_desc',
    },
    tags: {
        title: 'entity:empty.tags_title',
        description: 'entity:empty.tags_desc',
    },
    terms: {
        title: 'entity:empty.terms_title',
        description: 'entity:empty.terms_desc',
    },
    owners: {
        title: 'entity:empty.owners_title',
        description: 'entity:empty.owners_desc',
    },
    properties: {
        title: 'entity:empty.properties_title',
        description: 'entity:empty.properties_desc',
    },
    queries: {
        title: 'entity:empty.queries_title',
        description: 'entity:empty.queries_desc',
    },
    domain: {
        title: 'entity:empty.domain_title',
        description: 'entity:empty.domain_desc',
    },
    dataProduct: {
        title: 'entity:empty.data_product_title',
        description: 'entity:empty.data_product_desc',
    },
    contains: {
        title: 'entity:empty.contains_title',
        description: 'entity:empty.contains_desc',
    },
    inherits: {
        title: 'entity:empty.inherits_title',
        description: 'entity:empty.inherits_desc',
    },
    'contained by': {
        title: 'entity:empty.contained_by_title',
        description: 'entity:empty.contained_by_desc',
    },
    'inherited by': {
        title: 'entity:empty.inherited_by_title',
        description: 'entity:empty.inherited_by_desc',
    },
    businessAttributes: {
        title: 'entity:empty.business_attributes_title',
        description: 'entity:empty.business_attributes_desc',
    },
    mlModel: {
        title: 'entity:empty.ml_model_title',
        description: 'entity:empty.ml_model_desc',
    },
};

export const ELASTIC_MAX_COUNT = 10000;

export const getElasticCappedTotalValueText = (count: number) => {
    if (count === ELASTIC_MAX_COUNT) {
        return `${ELASTIC_MAX_COUNT}+`;
    }

    return `${count}`;
};

export const ENTITY_TYPES_WITH_MANUAL_LINEAGE = new Set([
    EntityType.Dashboard,
    EntityType.Chart,
    EntityType.Dataset,
    EntityType.DataJob,
]);

export const GLOSSARY_ENTITY_TYPES = [EntityType.GlossaryTerm, EntityType.GlossaryNode];

export const DEFAULT_SYSTEM_ACTOR_URNS = ['urn:li:corpuser:__datahub_system', 'urn:li:corpuser:unknown'];

export const VIEW_ENTITY_PAGE = 'VIEW_ENTITY_PAGE';

// only values for Domain Entity for custom configurable default tab
export enum EntityProfileTab {
    DOMAIN_ENTITIES_TAB = 'DOMAIN_ENTITIES_TAB',
    DOCUMENTATION_TAB = 'DOCUMENTATION_TAB',
    DATA_PRODUCTS_TAB = 'DATA_PRODUCTS_TAB',
}
