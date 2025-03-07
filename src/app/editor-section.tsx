"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { BadgeSelector } from "@/components/badge-selector";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash, GripVertical, Star, Brain } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useState, Dispatch, SetStateAction } from "react";

// New constant for deployment provider options
const DEPLOYMENT_PROVIDERS = [
  "Vercel",
  "Netlify",
  "GitHub Pages",
  "Heroku",
  "Firebase",
];

const SortableItem = ({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1">{children}</div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100"
        onClick={onRemove}
      >
        <Trash size={16} />
      </Button>
    </div>
  );
};

interface Deployment {
  provider: string;
  url: string;
}

interface EditorSectionProps {
  title: string;
  setTitle: (title: string) => void;
  coverImage: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setRepo: React.Dispatch<React.SetStateAction<string>>;
  setCoverImage: (url: string) => void;
  description: string;
  setDescription: (description: string) => void;
  demoUrl: string;
  setDemoUrl: (url: string) => void;
  license: string;
  setLicense: (license: string) => void;
  installation: string;
  setInstallation: (installation: string) => void;
  usage: string;
  setUsage: (usage: string) => void;
  features: string[];
  setFeatures: (features: string[]) => void;
  updateFeature: (index: number, feature: string) => void;
  development: string;
  setDevelopment: (development: string) => void;
  contributing: string;
  setContributing: (contributing: string) => void;
  tests: string;
  setTests: (tests: string) => void;
  badges: string[];
  setBadges: (badges: string[]) => void;
  username: string;
  repo: string;
  tocEnabled: boolean;
  setTocEnabled: (value: boolean) => void;
  openSections: {
    project: boolean;
    badges: boolean;
    documentation: boolean;
    media: boolean; // media & deployment
  };
  setOpenSections: React.Dispatch<
    React.SetStateAction<{
      project: boolean;
      badges: boolean;
      documentation: boolean;
      media: boolean;
    }>
  >;
  // New props for media and deployment sections:
  gifUrl: string;
  setGifUrl: (url: string) => void;
  deployments: Deployment[];
  setDeployments: (deployments: Deployment[]) => void;
  badgeStyle: string;
  setBadgeStyle: React.Dispatch<React.SetStateAction<string>>;
}

export function EditorSection({ ...props }: EditorSectionProps) {
  // AI customization states
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [includeUsage, setIncludeUsage] = useState(false);
  const [includeFeatures, setIncludeFeatures] = useState(false);

  // Function to generate AI description via an API endpoint.
  const generateAIDescription = async () => {
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: props.title,
          includeInstallation,
          includeUsage,
          includeFeatures,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate description");
      }
      const data = await response.json();
      props.setDescription(data.description);
    } catch (error) {
      console.error(error);
      // Optionally, display an error message to the user.
    }
  };

  const addFeature = () => props.setFeatures([...props.features, ""]);
  const removeFeature = (index: number) =>
    props.setFeatures(props.features.filter((_, i) => i !== index));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = props.features.findIndex((f) => f === active.id);
      const newIndex = props.features.findIndex((f) => f === over.id);
      const newFeatures = arrayMove(props.features, oldIndex, newIndex);
      props.setFeatures(newFeatures);
    }
  };

  const toggleSection = (section: keyof typeof props.openSections) => {
    props.setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // New functions for deployment management
  const addDeployment = () => {
    props.setDeployments([...props.deployments, { provider: "", url: "" }]);
  };

  const removeDeployment = (index: number) => {
    props.setDeployments(props.deployments.filter((_, i) => i !== index));
  };

  const updateDeployment = (index: number, deployment: Deployment) => {
    const newDeployments = [...props.deployments];
    newDeployments[index] = deployment;
    props.setDeployments(newDeployments);
  };

  return (
    <div className="space-y-6">
      {/* Project Metadata Section */}
      <Card className="p-6 border-b-subtle">
        <div className="space-y-4">
          {/* Header switch */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary w-2 h-2 rounded-full" />
              Project Setup
            </h3>
            <Switch
              checked={props.openSections.project}
              onCheckedChange={() => toggleSection("project")}
            />
          </div>

          {/* Content conditionally rendered */}
          {props.openSections.project && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 inline-block">
                  <span className="bg-primary w-3 h-3 rounded-full" />
                  <Label className="flex items-center gap-2">
                    Project Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={props.title}
                    onChange={(e) => props.setTitle(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full inline-block border-b-subtle"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input
                    value={props.coverImage}
                    onChange={(e) => props.setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    type="url"
                    className="w-full border-b-subtle"
                  />
                </div>
              </div>

              {/* AI Description Generation Section */}
              <div className="border p-4 rounded-md shadow-sm mb-4 bg-white dark:bg-gray-900 border-b-s">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  Generate AI Description <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-red-900 dark:text-red-300">with v0.2</span>
                </h3>
                <Button
                      
                  className="w-full relative overflow-hidden rounded-md text-white font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 shadow-lg shadow-purple-500/30"
                     disabled >   
                    Generate Description <Brain size={16} className="ml-2" />
                </Button>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={props.description}
                  onChange={(e) => props.setDescription(e.target.value)}
                  placeholder="Project description..."
                  className="min-h-[100px] w-full border-b-subtle"
                  maxLength={500}
                />
                <div className="text-sm text-muted-foreground border-b-subtle">
                  {props.description.length}/500 characters
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Demo URL</Label>
                  <Input
                    value={props.demoUrl}
                    onChange={(e) => props.setDemoUrl(e.target.value)}
                    placeholder="https://example.com/demo"
                    type="url"
                    className="w-full border-b-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>License</Label>
                  <Select value={props.license} onValueChange={props.setLicense}>
                    <SelectTrigger className="w-full border-b-subtle">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIT">MIT License</SelectItem>
                      <SelectItem value="Apache">Apache 2.0</SelectItem>
                      <SelectItem value="GNU">GNU GPLv3</SelectItem>
                      <SelectItem value="ISC">ISC License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Badge Selector Section */}
      <Card className="p-6 border-b-subtle">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary w-2 h-2 rounded-full" />
              Badges & Metadata
            </h3>
            <Switch
              checked={props.openSections.badges}
              onCheckedChange={() => toggleSection("badges")}
              className="border-b-subtle"
            />
          </div>
          {props.openSections.badges && (
            <div className="pt-4 border-b-subtle">
              <BadgeSelector
                badges={props.badges}
                setBadges={props.setBadges}
                username={props.username}
                repo={props.repo}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Media & Deployment Section */}
      <Card className="p-6 border-b-subtle">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary w-2 h-2 rounded-full" />
              Media & Deployment
            </h3>
            <Switch
              checked={props.openSections.media}
              onCheckedChange={() => toggleSection("media")}
            />
          </div>
          {props.openSections.media && (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Demo GIF URL</Label>
                <Input
                  value={props.gifUrl}
                  onChange={(e) => props.setGifUrl(e.target.value)}
                  placeholder="https://example.com/demo.gif"
                  type="url"
                  className="w-full border-b-subtle"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">
                    Deployments{" "}
                    <span className="rounded bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 dark:bg-red-900 dark:text-red-300">
                      with v0.2
                    </span>
                  </Label>
                  <Button
                    variant="outline"
                    onClick={addDeployment}
                    className="gap-2 disabled border-b-subtle"
                    disabled
                  >
                    <Plus size={16} />
                    Add Deployment
                  </Button>
                </div>
                {props.deployments.map((deployment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={deployment.provider}
                      onValueChange={(value) =>
                        updateDeployment(index, {
                          provider: value,
                          url: deployment.url,
                        })
                      }
                    >
                      <SelectTrigger className="w-full border-b-subtle">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPLOYMENT_PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={deployment.url}
                      onChange={(e) =>
                        updateDeployment(index, {
                          provider: deployment.provider,
                          url: e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                      type="url"
                      className="w-full border-b-subtle"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDeployment(index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Documentation Sections */}
      <Card className="p-6 border-b-subtle">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary w-2 h-2 rounded-full" />
              Documentation
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Table of Contents</Label>
                <Switch
                  checked={props.tocEnabled}
                  onCheckedChange={props.setTocEnabled}
                />
              </div>
              <Switch
                checked={props.openSections.documentation}
                onCheckedChange={() => toggleSection("documentation")}
              />
            </div>
          </div>
          {props.openSections.documentation && (
            <div className="space-y-6 pt-4 border-b-subtle">
              <SectionBlock
                title="Installation"
                value={props.installation}
                setValue={props.setInstallation}
              />
              <SectionBlock
                title="Usage"
                value={props.usage}
                setValue={props.setUsage}
              />
              <div className="space-y-4 border-b-subtle">
                <div className="flex items-center justify-between border-b-subtle">
                  <Label className="text-lg font-medium">Features</Label>
                  <Button
                    variant="outline"
                    onClick={addFeature}
                    className="gap-2 border-b-subtle"
                  >
                    <Plus size={16} />
                    Add Feature
                  </Button>
                </div>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="space-y-2 border-b-subtle">
                    {props.features.map((feature, index) => (
                      <SortableItem key={index} id={feature} onRemove={() => removeFeature(index)}>
                        <Input
                          value={feature}
                          onChange={(e) => props.updateFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          className="w-full border-b-subtle"
                        />
                      </SortableItem>
                    ))}
                  </div>
                </DndContext>
              </div>
              <SectionBlock
                title="Development"
                value={props.development}
                setValue={props.setDevelopment}
              />
              <SectionBlock
                title="Contributing"
                value={props.contributing}
                setValue={props.setContributing}
              />
              <SectionBlock
                title="Tests"
                value={props.tests}
                setValue={props.setTests}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

const SectionBlock = ({
  title,
  value,
  setValue,
}: {
  title: string;
  value: string;
  setValue: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-lg font-medium">{title}</Label>
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={`Enter ${title.toLowerCase()}...`}
      className="min-h-[120px] w-full border-b-subtle"
    />
  </div>
);

function arrayMove<T>(array: T[], oldIndex: number, newIndex: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(oldIndex, 1);
  newArray.splice(newIndex, 0, removed);
  return newArray;
}
