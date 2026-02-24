/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Fetchai } from '../nodes/Fetch.ai/Fetch.ai.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Fetchai Node', () => {
  let node: Fetchai;

  beforeAll(() => {
    node = new Fetchai();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Fetch.ai');
      expect(node.description.name).toBe('fetchai');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Agents Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('createAgent', () => {
    it('should create an agent successfully', async () => {
      const mockResponse = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'Test Description',
        status: 'created',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createAgent';
          case 'name': return 'Test Agent';
          case 'description': return 'Test Description';
          case 'code': return 'print("Hello World")';
          case 'protocols': return 'protocol1,protocol2';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://agentverse.ai/api/v1/agents',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'Test Agent',
          description: 'Test Description',
          code: 'print("Hello World")',
          protocols: ['protocol1', 'protocol2'],
        },
        json: true,
      });
    });

    it('should handle errors when creating agent', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createAgent';
          case 'name': return 'Test Agent';
          case 'code': return 'print("Hello World")';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
    });
  });

  describe('getAgent', () => {
    it('should get agent details successfully', async () => {
      const mockResponse = {
        id: 'agent-123',
        name: 'Test Agent',
        status: 'active',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAgent';
          case 'agentId': return 'agent-123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('listAgents', () => {
    it('should list agents with filters successfully', async () => {
      const mockResponse = {
        agents: [
          { id: 'agent-1', name: 'Agent 1', status: 'active' },
          { id: 'agent-2', name: 'Agent 2', status: 'active' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'listAgents';
          case 'limit': return 10;
          case 'offset': return 0;
          case 'status': return 'active';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://agentverse.ai/api/v1/agents?limit=10&offset=0&status=active',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('deployAgent', () => {
    it('should deploy agent successfully', async () => {
      const mockResponse = {
        id: 'agent-123',
        status: 'deploying',
        network: 'testnet',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'deployAgent';
          case 'agentId': return 'agent-123';
          case 'network': return 'testnet';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('stopAgent', () => {
    it('should stop agent successfully', async () => {
      const mockResponse = {
        id: 'agent-123',
        status: 'stopped',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'stopAgent';
          case 'agentId': return 'agent-123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });
});

describe('AgentCommunication Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('sendMessage operation', () => {
    it('should send message to agent successfully', async () => {
      const mockResponse = {
        messageId: 'msg-123',
        status: 'sent',
        timestamp: '2023-12-01T10:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'sendMessage';
          case 'agentId': return 'agent-123';
          case 'content': return 'Hello agent';
          case 'messageType': return 'text';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentCommunicationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://agentverse.ai/api/v1/agents/agent-123/messages',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          content: 'Hello agent',
          messageType: 'text',
        },
        json: true,
      });
    });

    it('should handle sendMessage error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'sendMessage';
          case 'agentId': return 'agent-123';
          case 'content': return 'Hello agent';
          case 'messageType': return 'text';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        executeAgentCommunicationOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  describe('getMessages operation', () => {
    it('should retrieve agent messages successfully', async () => {
      const mockResponse = {
        messages: [
          { id: 'msg-1', content: 'Hello', timestamp: '2023-12-01T10:00:00Z' },
          { id: 'msg-2', content: 'Hi', timestamp: '2023-12-01T10:01:00Z' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getMessages';
          case 'agentId': return 'agent-123';
          case 'limit': return 50;
          case 'offset': return 0;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentCommunicationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getMessage operation', () => {
    it('should get specific message successfully', async () => {
      const mockResponse = {
        id: 'msg-123',
        content: 'Hello agent',
        messageType: 'text',
        timestamp: '2023-12-01T10:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getMessage';
          case 'agentId': return 'agent-123';
          case 'messageId': return 'msg-123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentCommunicationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('registerProtocol operation', () => {
    it('should register protocol successfully', async () => {
      const mockResponse = {
        protocolId: 'protocol-123',
        status: 'registered',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'registerProtocol';
          case 'agentId': return 'agent-123';
          case 'protocolName': return 'test-protocol';
          case 'protocolSpec': return { version: '1.0', type: 'communication' };
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentCommunicationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getProtocols operation', () => {
    it('should get agent protocols successfully', async () => {
      const mockResponse = {
        protocols: [
          { id: 'protocol-1', name: 'test-protocol', version: '1.0' },
          { id: 'protocol-2', name: 'another-protocol', version: '2.0' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getProtocols';
          case 'agentId': return 'agent-123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAgentCommunicationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('AlmanacServices Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('registerService operation', () => {
    it('should register a service successfully', async () => {
      const mockResponse = {
        serviceId: 'service-123',
        name: 'Test Service',
        status: 'registered',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'registerService';
          case 'name': return 'Test Service';
          case 'description': return 'Test Description';
          case 'endpoints': return 'http://localhost:8080,http://localhost:8081';
          case 'protocols': return 'HTTP,WebSocket';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAlmanacServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://agentverse.ai/api/v1/almanac/services',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'Test Service',
          description: 'Test Description',
          endpoints: ['http://localhost:8080', 'http://localhost:8081'],
          protocols: ['HTTP', 'WebSocket'],
        },
        json: true,
      });
    });
  });

  describe('getService operation', () => {
    it('should get service details successfully', async () => {
      const mockResponse = {
        serviceId: 'service-123',
        name: 'Test Service',
        description: 'Test Description',
        endpoints: ['http://localhost:8080'],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getService';
          case 'serviceId': return 'service-123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAlmanacServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('searchServices operation', () => {
    it('should search services successfully', async () => {
      const mockResponse = {
        services: [
          { serviceId: 'service-1', name: 'Service 1' },
          { serviceId: 'service-2', name: 'Service 2' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'searchServices';
          case 'query': return 'test';
          case 'category': return 'AI';
          case 'location': return 'US';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAlmanacServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getService';
          case 'serviceId': return 'invalid-id';
          default: return '';
        }
      });

      const error = new Error('Service not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeAlmanacServicesOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getService';
          case 'serviceId': return 'invalid-id';
          default: return '';
        }
      });

      const error = new Error('Service not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeAlmanacServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Service not found');
    });
  });
});

describe('DeltaVTasks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should create a task successfully', async () => {
    const mockResponse = {
      id: 'task-123',
      description: 'Test task',
      status: 'pending',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createTask';
        case 'description': return 'Test task';
        case 'requirements': return 'Test requirements';
        case 'budget': return 100;
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://agentverse.ai/api/v1/deltav/tasks',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        description: 'Test task',
        requirements: 'Test requirements',
        budget: 100,
      },
      json: true,
    });
  });

  test('should get task details successfully', async () => {
    const mockResponse = {
      id: 'task-123',
      description: 'Test task',
      status: 'running',
      progress: 50,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTask';
        case 'taskId': return 'task-123';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://agentverse.ai/api/v1/deltav/tasks/task-123',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should list tasks with filters successfully', async () => {
    const mockResponse = {
      tasks: [
        { id: 'task-1', status: 'pending' },
        { id: 'task-2', status: 'pending' },
      ],
      total: 2,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'listTasks';
        case 'status': return 'pending';
        case 'limit': return 10;
        case 'offset': return 0;
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://agentverse.ai/api/v1/deltav/tasks?status=pending&limit=10&offset=0',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should accept task proposal successfully', async () => {
    const mockResponse = {
      id: 'task-123',
      status: 'accepted',
      proposalId: 'proposal-456',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'acceptTaskProposal';
        case 'taskId': return 'task-123';
        case 'proposalId': return 'proposal-456';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://agentverse.ai/api/v1/deltav/tasks/task-123/accept',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        proposalId: 'proposal-456',
      },
      json: true,
    });
  });

  test('should handle API errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTask';
        case 'taskId': return 'invalid-task';
        default: return null;
      }
    });

    const apiError = new Error('Task not found');
    apiError.cause = {
      response: {
        statusCode: 404,
        body: { message: 'Task not found' },
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    await expect(
      executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTask';
        case 'taskId': return 'invalid-task';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeDeltaVTasksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });
});

describe('NetworkNodes Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getNetworkNodes', () => {
    it('should successfully get network nodes with filters', async () => {
      const mockResponse = {
        nodes: [
          {
            id: 'node1',
            type: 'validator',
            status: 'active',
            location: 'US-East',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getNetworkNodes';
          case 'nodeType': return 'validator';
          case 'status': return 'active';
          case 'location': return 'US-East';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://agentverse.ai/api/v1/network/nodes?nodeType=validator&status=active&location=US-East',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getNodeInfo', () => {
    it('should successfully get node information', async () => {
      const mockResponse = {
        id: 'node123',
        type: 'validator',
        status: 'active',
        uptime: '99.5%',
        location: 'US-West',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getNodeInfo';
          case 'nodeId': return 'node123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getNetworkStats', () => {
    it('should successfully get network statistics', async () => {
      const mockResponse = {
        totalNodes: 150,
        activeNodes: 142,
        networkHealth: 'healthy',
        averageLatency: '45ms',
        blockTime: '2.1s',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getNetworkStats';
          case 'timeframe': return '24h';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getValidators', () => {
    it('should successfully get validators list', async () => {
      const mockResponse = {
        validators: [
          {
            address: 'validator1',
            votingPower: '1000000',
            commission: '5%',
            status: 'active',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getValidators';
          case 'active': return true;
          case 'limit': return 50;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getRecentBlocks', () => {
    it('should successfully get recent blocks', async () => {
      const mockResponse = {
        blocks: [
          {
            height: 12345,
            hash: 'block_hash_123',
            timestamp: '2024-01-01T00:00:00Z',
            transactions: 25,
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getRecentBlocks';
          case 'limit': return 10;
          case 'offset': return 0;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getNetworkNodes');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      await expect(
        executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });

    it('should handle unknown operations', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

      await expect(
        executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });

    it('should continue on fail when configured', async () => {
      const apiError = new Error('API Error');
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getNetworkNodes');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeNetworkNodesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 },
      }]);
    });
  });
});

describe('Wallets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://agentverse.ai/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getWallet operation', () => {
    it('should get wallet information successfully', async () => {
      const mockWalletData = {
        address: 'fetch1abc123',
        balance: '1000000000000000000',
        stake: '500000000000000000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getWallet';
        if (param === 'address') return 'fetch1abc123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockWalletData);

      const result = await executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://agentverse.ai/api/v1/wallets/fetch1abc123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockWalletData,
        pairedItem: { item: 0 },
      }]);
    });

    it('should handle errors when getting wallet information', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getWallet';
        if (param === 'address') return 'invalid-address';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Wallet not found'));

      await expect(executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow('Wallet not found');
    });
  });

  describe('getTransactions operation', () => {
    it('should get wallet transactions successfully', async () => {
      const mockTransactions = {
        transactions: [
          { hash: 'tx1', amount: '100000000000000000', type: 'transfer' },
          { hash: 'tx2', amount: '50000000000000000', type: 'stake' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'getTransactions';
        if (param === 'address') return 'fetch1abc123';
        if (param === 'limit') return defaultValue || 50;
        if (param === 'offset') return defaultValue || 0;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactions);

      const result = await executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockTransactions,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('createTransfer operation', () => {
    it('should create transfer successfully', async () => {
      const mockTransferResponse = {
        transactionHash: 'tx_hash_123',
        status: 'pending',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'createTransfer';
        if (param === 'fromAddress') return 'fetch1abc123';
        if (param === 'toAddress') return 'fetch1def456';
        if (param === 'amount') return '1000000000000000000';
        if (param === 'memo') return defaultValue || '';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransferResponse);

      const result = await executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://agentverse.ai/api/v1/wallets/transfer',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          fromAddress: 'fetch1abc123',
          toAddress: 'fetch1def456',
          amount: '1000000000000000000',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockTransferResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getStakes operation', () => {
    it('should get wallet stakes successfully', async () => {
      const mockStakesData = {
        totalStaked: '500000000000000000',
        validators: [
          { validator: 'validator1', amount: '300000000000000000' },
          { validator: 'validator2', amount: '200000000000000000' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getStakes';
        if (param === 'address') return 'fetch1abc123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStakesData);

      const result = await executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockStakesData,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('stakeTokens operation', () => {
    it('should stake tokens successfully', async () => {
      const mockStakeResponse = {
        transactionHash: 'stake_tx_123',
        status: 'pending',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'stakeTokens';
        if (param === 'address') return 'fetch1abc123';
        if (param === 'amount') return '100000000000000000';
        if (param === 'validator') return 'validator1';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStakeResponse);

      const result = await executeWalletsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://agentverse.ai/api/v1/wallets/fetch1abc123/stake',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          amount: '100000000000000000',
          validator: 'validator1',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockStakeResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });
});
});
