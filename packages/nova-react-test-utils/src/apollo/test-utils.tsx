import * as React from "react";
import { ApolloProvider } from "@apollo/client";
import type { GraphQLSchema } from "graphql";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";
import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { OperationDescriptor } from "@graphitation/graphql-js-operation-payload-generator";
import { generate as payloadGenerator } from "@graphitation/graphql-js-operation-payload-generator";
import type { GraphQLTaggedNode } from "@nova/react";
import type {
  NovaCentralizedCommanding,
  NovaEventing,
  NovaGraphQL,
} from "@nova/types";
import type { NovaMockEnvironment } from "./nova-mock-environment";
import { defaultLocalization } from "../shared/shared-utils";

type MockClientOptions = Parameters<typeof createMockClient>[1];

type Generate<Schema, Node> = (
  operation: OperationDescriptor<Schema, Node>,
  mockResolvers?: Parameters<typeof payloadGenerator>[1],
  generateId?: () => number,
) => ReturnType<typeof payloadGenerator>;

export const ApolloMockPayloadGenerator: {
  /**
   * Given an operation descriptor generates a payload to satisfy the request. For details on the API see
   * {@see https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator}
   */
  generate: Generate<unknown, GraphQLTaggedNode>;
} = {
  generate: payloadGenerator as Generate<any, any>,
};

const noop = () => Promise.resolve();

/**
 * Creates a Nova environment object that can be used with the NovaMockEnvironmentProvider and has mocks instantiated
 * for each piece of the facade interface. Check README for details.
 */
export function createNovaApolloEnvironment(
  schema: GraphQLSchema,
  options?: MockClientOptions,
  commandingTriggerMock?: NovaCentralizedCommanding["trigger"],
  eventingBubbleMock?: NovaEventing["bubble"],
): NovaMockEnvironment {
  const client = createMockClient(schema, options);
  const env: NovaMockEnvironment = {
    type: "apollo",
    commanding: {
      trigger: commandingTriggerMock || noop,
    },
    eventing: {
      bubble: eventingBubbleMock || noop,
    },
    graphql: {
      ...(GraphQLHooks as NovaGraphQL),
      mock: client.mock as MockFunctions<any, any>,
    },
    providerWrapper: ({ children }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
    localization: defaultLocalization,
  };
  return env;
}
