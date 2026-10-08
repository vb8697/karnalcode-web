"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  createSolution,
  fetchMyVotes,
  fetchNextDoubtHour,
  fetchQuestion,
  fetchQuestions,
  fetchSimilar,
  fetchTopHelpers,
  setVote,
  type NewQuestion,
} from "@/lib/doubts";
import { fetchMySaves, fetchNotes, recordDownload, setSaved, uploadNote, type NewNote } from "@/lib/notes";
import { fetchPublicProfile } from "@/lib/people";
import { fetchProfileDetails } from "@/lib/profile";
import { useSession } from "@/lib/useSession";

export function useUserId(): string | undefined {
  return useSession().session?.user.id;
}

export const useQuestions = () => useQuery({ queryKey: ["questions"], queryFn: fetchQuestions });

/** Same data as the feed, but checked again every 30 seconds so new doubts appear by themselves. */
export const useLiveQuestions = () =>
  useQuery({ queryKey: ["questions"], queryFn: fetchQuestions, refetchInterval: 30_000, refetchIntervalInBackground: false });

/** Course and semester of the signed-in user, used to put the most relevant papers first. */
export function useMyProfile() {
  const userId = useUserId();
  return useQuery({ queryKey: ["my-profile", userId], queryFn: () => fetchProfileDetails(userId!), enabled: !!userId });
}

export const useQuestion = (id: string) => useQuery({ queryKey: ["question", id], queryFn: () => fetchQuestion(id) });

export function useMyVotes() {
  const userId = useUserId();
  const query = useQuery({ queryKey: ["votes", userId], queryFn: () => fetchMyVotes(userId!), enabled: !!userId });
  return new Set(query.data ?? []);
}

export function useSimilar(title: string) {
  const enabled = title.trim().length >= 8;
  return useQuery({ queryKey: ["similar", title.trim()], queryFn: () => fetchSimilar(title), enabled, staleTime: 30_000 });
}

export const useTopHelpers = () => useQuery({ queryKey: ["helpers"], queryFn: fetchTopHelpers });
export const useNextDoubtHour = () => useQuery({ queryKey: ["doubt-hour"], queryFn: fetchNextDoubtHour });

export function useAddQuestion() {
  const userId = useUserId();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewQuestion) => createQuestion(input, userId!),
    onSuccess: () => client.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useAddSolution(questionId: string) {
  const userId = useUserId();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => createSolution(questionId, text, userId!),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["question", questionId] });
      client.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useToggleVote(questionId: string) {
  const userId = useUserId();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ solutionId, voted }: { solutionId: string; voted: boolean }) => setVote(solutionId, userId!, voted),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["question", questionId] });
      client.invalidateQueries({ queryKey: ["votes"] });
      client.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export const useNotes = () => useQuery({ queryKey: ["notes"], queryFn: fetchNotes });

export function useMySaves() {
  const userId = useUserId();
  const query = useQuery({ queryKey: ["saves", userId], queryFn: () => fetchMySaves(userId!), enabled: !!userId });
  return new Set(query.data ?? []);
}

export function useToggleSave() {
  const userId = useUserId();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, saved }: { noteId: string; saved: boolean }) => setSaved(noteId, userId!, saved),
    onSuccess: () => client.invalidateQueries({ queryKey: ["saves"] }),
  });
}

export function useRecordDownload() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => recordDownload(noteId),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUploadNote() {
  const userId = useUserId();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewNote) => uploadNote(input, userId!),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export const usePublicProfile = (id: string) => useQuery({ queryKey: ["people", id], queryFn: () => fetchPublicProfile(id) });
