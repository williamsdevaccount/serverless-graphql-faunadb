'use strict';

import graphqlModule from './blog/graphql/handler'

import {setupFaunaDBSchema} from './blog/lib/faunadb'


// Lambda Handler
const graphql = graphqlModule.handler;
const setupFaunaDB = setupFaunaDBSchema;
export {graphql, setupFaunaDB};
