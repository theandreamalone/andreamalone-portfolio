import gsap from "gsap"
import { useEffect, useRef } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

type AnimatedElement = HTMLElement & {
	animation?: gsap.core.Tween
	split?: { chars: HTMLElement[]; originalHTML: string }
}

gsap.registerPlugin(ScrollTrigger)

export default function useTextAnimation3() {
	const elementsRef = useRef<AnimatedElement[]>([])

	const triggersRef = useRef<ScrollTrigger[]>([])

	useEffect(() => {
		if (typeof window === "undefined") return

		elementsRef.current = Array.from(
			document.querySelectorAll(".text-anime-style-3") as NodeListOf<AnimatedElement>
		)

		if (elementsRef.current.length === 0) {
			console.warn("No elements with class 'text-anime-style-3' found.")
			return
		}

		elementsRef.current.forEach((element) => {
			if (element.animation) {
				element.animation.progress(1).kill()
			}
			if (element.split) {
				element.innerHTML = element.split.originalHTML
			}

			element.split = splitText(element)

			gsap.set(element, { perspective: 400 })
			gsap.set(element.split.chars, { opacity: 0, x: 50 })

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: {
					trigger: element,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
				x: 0,
				opacity: 1,
				duration: 1,
				ease: "back.out(1.7)",
				stagger: 0.03,
			})

			if (element.animation.scrollTrigger) {
				triggersRef.current.push(element.animation.scrollTrigger)
			}
		})

		return () => {
			elementsRef.current.forEach((element) => {
				if (element.animation) {
					element.animation.kill()
				}
				if (element.split) {
					element.innerHTML = element.split.originalHTML
				}
			})
			triggersRef.current.forEach((trigger) => trigger.kill())
			triggersRef.current = []
		}
	}, [])

	const splitText = (element: HTMLElement) => {
		const originalHTML = element.innerHTML

		const filter: NodeFilter = {
			acceptNode: (node: Node) =>
				node.nodeType === Node.TEXT_NODE
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT,
		}

		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, filter)
		const textNodes: Node[] = []
		let node: Node | null

		while ((node = walker.nextNode())) {
			textNodes.push(node)
		}

		const chars: HTMLElement[] = []
		textNodes.forEach((textNode) => {
			const parent = textNode.parentElement!
			const text = textNode.textContent || ""
			if (text.trim()) {
				const span = document.createElement("span")
				span.className = "split-wrapper"
				span.innerHTML = text
					.split("")
					.map((char) => `<span class="split-char">${char}</span>`)
					.join("")
				parent.replaceChild(span, textNode)
				// Cast querySelectorAll result to HTMLElement
				chars.push(
					...Array.from(span.querySelectorAll(".split-char") as NodeListOf<HTMLElement>)
				)
			}
		})

		if (chars.length === 0) {
			console.warn("No characters found to animate in:", element)
		}

		return {
			chars,
			originalHTML,
		}
	}

	return null
}