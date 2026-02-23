import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Clock, FileText, ChevronRight, Loader2, X } from 'lucide-react';
import { workflowsApi } from '@/services/api';
import { formatRelative, formatDocumentType } from '@/utils/format';
import type { WorkflowTemplate, WorkflowInstance } from '@docudex/shared-types';

export default function Workflows() {
  const qc = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowInstance | null>(null);

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => workflowsApi.getTemplates(),
  });

  const { data: instancesData, isLoading: instancesLoading } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowsApi.getInstances(),
  });

  const startMutation = useMutation({
    mutationFn: (templateId: string) => workflowsApi.startWorkflow(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow-instances'] });
      setSelectedTemplate(null);
    },
  });

  const templates: WorkflowTemplate[] = templatesData?.data ?? [];
  const instances: WorkflowInstance[] = instancesData?.data?.instances ?? instancesData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Workflows</h1>
        <p className="text-gray-500 mt-1">
          AI-guided checklists for common document requirements
        </p>
      </div>

      {/* Templates */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Workflows</h2>
        {templatesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className="card text-left hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{tpl.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{tpl.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {tpl.requiredDocuments?.length ?? 0} required documents · {tpl.estimatedTime}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Active workflows */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Active Workflows</h2>
        {instancesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : instances.length === 0 ? (
          <div className="card text-center py-10">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No active workflows. Start one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instances.map((inst) => {
              const pct = inst.totalSteps > 0
                ? Math.round((inst.currentStep / inst.totalSteps) * 100)
                : 0;
              return (
                <button
                  key={inst.id}
                  onClick={() => setActiveWorkflow(inst)}
                  className="card w-full text-left hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{inst.templateName}</h3>
                    <span className="text-xs text-gray-500">{formatRelative(inst.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{pct}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Step {inst.currentStep} / {inst.totalSteps} · {inst.status.replace(/_/g, ' ')}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Template detail modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h2>
              <button onClick={() => setSelectedTemplate(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">{selectedTemplate.description}</p>
            <p className="text-xs text-gray-400 mb-4">Estimated: {selectedTemplate.estimatedTime}</p>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Required Documents:</h3>
            <ul className="space-y-2 mb-6">
              {selectedTemplate.requiredDocuments?.map((docType, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{formatDocumentType(docType)}</span>
                </li>
              ))}
            </ul>
            <button
              className="btn-primary w-full justify-center"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate(selectedTemplate.id)}
            >
              {startMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Workflow
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active workflow detail modal */}
      {activeWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeWorkflow.templateName}
              </h2>
              <button onClick={() => setActiveWorkflow(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium">{activeWorkflow.status.replace(/_/g, ' ')}</span>
              </p>
              <p className="text-sm text-gray-600">
                Progress: <span className="font-medium">{activeWorkflow.currentStep} / {activeWorkflow.totalSteps} steps</span>
              </p>
              {activeWorkflow.referenceNumber && (
                <p className="text-sm text-gray-600">
                  Reference: <span className="font-medium font-mono">{activeWorkflow.referenceNumber}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Started {formatRelative(activeWorkflow.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
