"use client";

import { useState } from "react";
import { OtherChipGroup } from "@/components/OtherChipGroup";
import { ChipGroup, Segmented, TextArea, TextField, Button } from "@/components/ui";
import {
  BRANCHES,
  COURSES,
  MAX_BIO_LENGTH,
  MAX_COLLEGE_LENGTH,
  SEMESTERS,
  validateProfileForm,
  type FormErrors,
  type Occupation,
  type ProfileFormValues,
} from "@/lib/profile";

type ProfileFormProps = {
  initial: ProfileFormValues;
  colleges: string[];
  mode: "onboarding" | "edit";
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function ProfileForm({ initial, colleges, mode, onSubmit, onCancel }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const working = values.occupation === "working";
  // A college that is not in the list was typed by the user; show it in the text box, not as a chip.
  const customCollege = values.college && !colleges.includes(values.college) ? values.college : "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateProfileForm(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save your profile. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <TextField
        label="Full name"
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
        autoComplete="name"
      />

      {colleges.length > 0 ? (
        <ChipGroup label="College" options={colleges} value={values.college} onChange={(v) => set("college", v)} error={errors.college} />
      ) : null}
      <TextField
        label={colleges.length > 0 ? "Not in the list? Type your college (optional)" : "College"}
        error={colleges.length > 0 ? undefined : errors.college}
        value={customCollege}
        onChange={(e) => set("college", e.target.value)}
        placeholder="Your college name"
        maxLength={MAX_COLLEGE_LENGTH}
        autoComplete="organization"
      />
      <OtherChipGroup label="Course" options={COURSES} value={values.course} onChange={(v) => set("course", v)} error={errors.course} customPlaceholder="e.g. BBA, B.Sc Computer Science" />
      <OtherChipGroup label="Branch" options={BRANCHES} value={values.branch} onChange={(v) => set("branch", v)} error={errors.branch} customPlaceholder="e.g. Robotics, Cloud Computing" />

      <Segmented
        label="I am currently"
        value={values.occupation}
        onChange={(v) => set("occupation", v as Occupation)}
        options={[
          { value: "student", label: "Student" },
          { value: "working", label: "Working" },
        ]}
      />

      {working ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Job title"
            value={values.jobTitle}
            onChange={(e) => set("jobTitle", e.target.value)}
            error={errors.jobTitle}
            placeholder="e.g. Software Engineer"
          />
          <TextField
            label="Company"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            error={errors.company}
            placeholder="Where you work"
          />
          <TextField
            label="Graduation year (optional)"
            value={values.graduationYear}
            onChange={(e) => set("graduationYear", e.target.value.replace(/[^0-9]/g, ""))}
            error={errors.graduationYear}
            placeholder="e.g. 2025"
            inputMode="numeric"
            maxLength={4}
          />
        </div>
      ) : (
        <ChipGroup label="Semester" options={SEMESTERS} value={values.semester} onChange={(v) => set("semester", v)} error={errors.semester} />
      )}

      <TextArea
        label="About you (optional)"
        value={values.bio}
        onChange={(e) => set("bio", e.target.value)}
        error={errors.bio}
        maxLength={MAX_BIO_LENGTH}
        hint={`${values.bio.length}/${MAX_BIO_LENGTH}`}
        placeholder={working ? "Tell juniors how you got here" : "What are you learning or building?"}
      />

      {formError ? (
        <p role="alert" className="text-sm text-error">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            {mode === "onboarding" ? "Skip for now" : "Cancel"}
          </Button>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
