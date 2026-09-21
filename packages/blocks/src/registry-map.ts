/** Block registry — maps "category/file" to its React implementation.
 *  Generated from the filesystem: python3 tools/extract/gen_registry.py
 *  (or edit carefully after adding a block). */
import { Feed as activity_feedC } from "./activity/feed/react.js";
import activity_feedMRaw from "./activity/feed/block.json";
import { Timeline as activity_timelineC } from "./activity/timeline/react.js";
import activity_timelineMRaw from "./activity/timeline/block.json";
import { AgentFlow as ai_agentflowC } from "./ai/agent-flow/react.js";
import ai_agentflowMRaw from "./ai/agent-flow/block.json";
import { Presence as ai_presenceC } from "./ai/presence/react.js";
import ai_presenceMRaw from "./ai/presence/block.json";
import { PromptBox as ai_promptboxC } from "./ai/prompt-box/react.js";
import ai_promptboxMRaw from "./ai/prompt-box/block.json";
import { Retrieval as ai_retrievalC } from "./ai/retrieval/react.js";
import ai_retrievalMRaw from "./ai/retrieval/block.json";
import { Tools as ai_toolsC } from "./ai/tools/react.js";
import ai_toolsMRaw from "./ai/tools/block.json";
import { Voice as ai_voiceC } from "./ai/voice/react.js";
import ai_voiceMRaw from "./ai/voice/block.json";
import { Logs as api_logsC } from "./api/logs/react.js";
import api_logsMRaw from "./api/logs/block.json";
import { Request as api_requestC } from "./api/request/react.js";
import api_requestMRaw from "./api/request/block.json";
import { Webhook as api_webhookC } from "./api/webhook/react.js";
import api_webhookMRaw from "./api/webhook/block.json";
import { AvatarGrid as avatars_gridC } from "./avatars/grid/react.js";
import avatars_gridMRaw from "./avatars/grid/block.json";
import { Stack as avatars_stackC } from "./avatars/stack/react.js";
import avatars_stackMRaw from "./avatars/stack/block.json";
import { ProfileCard as avatars_profilecardC } from "./avatars/profile-card/react.js";
import avatars_profilecardMRaw from "./avatars/profile-card/block.json";
import { Spotlight as branding_spotlightC } from "./branding/spotlight/react.js";
import branding_spotlightMRaw from "./branding/spotlight/block.json";
import { Loading as browser_loadingC } from "./browser/loading/react.js";
import browser_loadingMRaw from "./browser/loading/block.json";
import { Simple as browser_simpleC } from "./browser/simple/react.js";
import browser_simpleMRaw from "./browser/simple/block.json";
import { Tabs as browser_tabsC } from "./browser/tabs/react.js";
import browser_tabsMRaw from "./browser/tabs/block.json";
import { DatePicker as calendar_datepickerC } from "./calendar/date-picker/react.js";
import calendar_datepickerMRaw from "./calendar/date-picker/block.json";
import { EventList as calendar_eventlistC } from "./calendar/event-list/react.js";
import calendar_eventlistMRaw from "./calendar/event-list/block.json";
import { MonthView as calendar_monthviewC } from "./calendar/month-view/react.js";
import calendar_monthviewMRaw from "./calendar/month-view/block.json";
import { Bar as charts_barC } from "./charts/bar/react.js";
import charts_barMRaw from "./charts/bar/block.json";
import { Donut as charts_donutC } from "./charts/donut/react.js";
import charts_donutMRaw from "./charts/donut/block.json";
import { Funnel as charts_funnelC } from "./charts/funnel/react.js";
import charts_funnelMRaw from "./charts/funnel/block.json";
import { Gauge as charts_gaugeC } from "./charts/gauge/react.js";
import charts_gaugeMRaw from "./charts/gauge/block.json";
import { Heatmap as charts_heatmapC } from "./charts/heatmap/react.js";
import charts_heatmapMRaw from "./charts/heatmap/block.json";
import { Line as charts_lineC } from "./charts/line/react.js";
import charts_lineMRaw from "./charts/line/block.json";
import { Sparkline as charts_sparklineC } from "./charts/sparkline/react.js";
import charts_sparklineMRaw from "./charts/sparkline/block.json";
import { AiChat as chat_aichatC } from "./chat/ai-chat/react.js";
import chat_aichatMRaw from "./chat/ai-chat/block.json";
import { Bubbles as chat_bubblesC } from "./chat/bubbles/react.js";
import chat_bubblesMRaw from "./chat/bubbles/block.json";
import { Thread as chat_threadC } from "./chat/thread/react.js";
import chat_threadMRaw from "./chat/thread/block.json";
import { Editor as code_editorC } from "./code/editor/react.js";
import code_editorMRaw from "./code/editor/block.json";
import { Snippet as code_snippetC } from "./code/snippet/react.js";
import code_snippetMRaw from "./code/snippet/block.json";
import { Terminal as code_terminalC } from "./code/terminal/react.js";
import code_terminalMRaw from "./code/terminal/block.json";
import { Converge as connections_convergeC } from "./connections/converge/react.js";
import connections_convergeMRaw from "./connections/converge/block.json";
import { Flow as connections_flowC } from "./connections/flow/react.js";
import connections_flowMRaw from "./connections/flow/block.json";
import { Pipeline as connections_pipelineC } from "./connections/pipeline/react.js";
import connections_pipelineMRaw from "./connections/pipeline/block.json";
import { Sync as connections_syncC } from "./connections/sync/react.js";
import connections_syncMRaw from "./connections/sync/block.json";
import { Filters as data_filtersC } from "./data/filters/react.js";
import data_filtersMRaw from "./data/filters/block.json";
import { Import as data_importC } from "./data/import/react.js";
import data_importMRaw from "./data/import/block.json";
import { Query as data_queryC } from "./data/query/react.js";
import data_queryMRaw from "./data/query/block.json";
import { Table as data_tableC } from "./data/table/react.js";
import data_tableMRaw from "./data/table/block.json";
import { MiniPanel as dashboard_minipanelC } from "./dashboard/mini-panel/react.js";
import dashboard_minipanelMRaw from "./dashboard/mini-panel/block.json";
import { WidgetGrid as dashboard_widgetgridC } from "./dashboard/widget-grid/react.js";
import dashboard_widgetgridMRaw from "./dashboard/widget-grid/block.json";
import { Laptop as devices_laptopC } from "./devices/laptop/react.js";
import devices_laptopMRaw from "./devices/laptop/block.json";
import { Phone as devices_phoneC } from "./devices/phone/react.js";
import devices_phoneMRaw from "./devices/phone/block.json";
import { Tablet as devices_tabletC } from "./devices/tablet/react.js";
import devices_tabletMRaw from "./devices/tablet/block.json";
import { Compose as email_composeC } from "./email/compose/react.js";
import email_composeMRaw from "./email/compose/block.json";
import { Inbox as email_inboxC } from "./email/inbox/react.js";
import email_inboxMRaw from "./email/inbox/block.json";
import { Explorer as files_explorerC } from "./files/explorer/react.js";
import files_explorerMRaw from "./files/explorer/block.json";
import { SimpleFile as files_simpleC } from "./files/simple/react.js";
import files_simpleMRaw from "./files/simple/block.json";
import { Stacked as files_stackedC } from "./files/stacked/react.js";
import files_stackedMRaw from "./files/stacked/block.json";
import { Upload as files_uploadC } from "./files/upload/react.js";
import files_uploadMRaw from "./files/upload/block.json";
import { Globe as geo_globeC } from "./geo/globe/react.js";
import geo_globeMRaw from "./geo/globe/block.json";
import { PinDrop as geo_pindropC } from "./geo/pin-drop/react.js";
import geo_pindropMRaw from "./geo/pin-drop/block.json";
import { WorldMap as geo_worldmapC } from "./geo/world-map/react.js";
import geo_worldmapMRaw from "./geo/world-map/block.json";
import { BranchGraph as git_branchgraphC } from "./git/branch-graph/react.js";
import git_branchgraphMRaw from "./git/branch-graph/block.json";
import { Diff as git_diffC } from "./git/diff/react.js";
import git_diffMRaw from "./git/diff/block.json";
import { PullRequest as git_pullrequestC } from "./git/pull-request/react.js";
import git_pullrequestMRaw from "./git/pull-request/block.json";
import { Carousel as images_carouselC } from "./images/carousel/react.js";
import images_carouselMRaw from "./images/carousel/block.json";
import { Gallery as images_galleryC } from "./images/gallery/react.js";
import images_galleryMRaw from "./images/gallery/block.json";
import { Hub as integrations_hubC } from "./integrations/hub/react.js";
import integrations_hubMRaw from "./integrations/hub/block.json";
import { LogoOrbit as integrations_logoorbitC } from "./integrations/logo-orbit/react.js";
import integrations_logoorbitMRaw from "./integrations/logo-orbit/block.json";
import { LogoReel as integrations_logoreelC } from "./integrations/logo-reel/react.js";
import integrations_logoreelMRaw from "./integrations/logo-reel/block.json";
import { Half as keyboard_halfC } from "./keyboard/half/react.js";
import keyboard_halfMRaw from "./keyboard/half/block.json";
import { Shortcut as keyboard_shortcutC } from "./keyboard/shortcut/react.js";
import keyboard_shortcutMRaw from "./keyboard/shortcut/block.json";
import { AudioWaveform as media_audiowaveformC } from "./media/audio-waveform/react.js";
import media_audiowaveformMRaw from "./media/audio-waveform/block.json";
import { VideoPlayer as media_videoplayerC } from "./media/video-player/react.js";
import media_videoplayerMRaw from "./media/video-player/block.json";
import { Comparison as metrics_comparisonC } from "./metrics/comparison/react.js";
import metrics_comparisonMRaw from "./metrics/comparison/block.json";
import { StatCard as metrics_statcardC } from "./metrics/stat-card/react.js";
import metrics_statcardMRaw from "./metrics/stat-card/block.json";
import { Trend as metrics_trendC } from "./metrics/trend/react.js";
import metrics_trendMRaw from "./metrics/trend/block.json";
import { Bell as notifications_bellC } from "./notifications/bell/react.js";
import notifications_bellMRaw from "./notifications/bell/block.json";
import { NotificationList as notifications_listC } from "./notifications/list/react.js";
import notifications_listMRaw from "./notifications/list/block.json";
import { Toast as notifications_toastC } from "./notifications/toast/react.js";
import notifications_toastMRaw from "./notifications/toast/block.json";
import { Checkout as payments_checkoutC } from "./payments/checkout/react.js";
import payments_checkoutMRaw from "./payments/checkout/block.json";
import { CreditCard as payments_creditcardC } from "./payments/credit-card/react.js";
import payments_creditcardMRaw from "./payments/credit-card/block.json";
import { UsageMeter as payments_usagemeterC } from "./payments/usage-meter/react.js";
import payments_usagemeterMRaw from "./payments/usage-meter/block.json";
import { CommandPalette as search_commandpaletteC } from "./search/command-palette/react.js";
import search_commandpaletteMRaw from "./search/command-palette/block.json";
import { Results as search_resultsC } from "./search/results/react.js";
import search_resultsMRaw from "./search/results/block.json";
import { Semantic as search_semanticC } from "./search/semantic/react.js";
import search_semanticMRaw from "./search/semantic/block.json";
import { Auth as sections_authC } from "./sections/auth/react.js";
import sections_authMRaw from "./sections/auth/block.json";
import { Backgrounds as sections_backgroundsC } from "./sections/backgrounds/react.js";
import sections_backgroundsMRaw from "./sections/backgrounds/block.json";
import { Bento as sections_bentoC } from "./sections/bento/react.js";
import sections_bentoMRaw from "./sections/bento/block.json";
import { Blog as sections_blogC } from "./sections/blog/react.js";
import sections_blogMRaw from "./sections/blog/block.json";
import { BlogPost as sections_blogpostC } from "./sections/blog-post/react.js";
import sections_blogpostMRaw from "./sections/blog-post/block.json";
import { Comments as sections_commentsC } from "./sections/comments/react.js";
import sections_commentsMRaw from "./sections/comments/block.json";
import { Components as sections_componentsC } from "./sections/components/react.js";
import sections_componentsMRaw from "./sections/components/block.json";
import { Contact as sections_contactC } from "./sections/contact/react.js";
import sections_contactMRaw from "./sections/contact/block.json";
import { Cta as sections_ctaC } from "./sections/cta/react.js";
import sections_ctaMRaw from "./sections/cta/block.json";
import { Error as sections_errorC } from "./sections/error/react.js";
import sections_errorMRaw from "./sections/error/block.json";
import { Faq as sections_faqC } from "./sections/faq/react.js";
import sections_faqMRaw from "./sections/faq/block.json";
import { Features as sections_featuresC } from "./sections/features/react.js";
import sections_featuresMRaw from "./sections/features/block.json";
import { Footer as sections_footersC } from "./sections/footers/react.js";
import sections_footersMRaw from "./sections/footers/block.json";
import { Header as sections_headersC } from "./sections/headers/react.js";
import sections_headersMRaw from "./sections/headers/block.json";
import { Hero as sections_heroC } from "./sections/hero/react.js";
import sections_heroMRaw from "./sections/hero/block.json";
import { Logos as sections_logosC } from "./sections/logos/react.js";
import sections_logosMRaw from "./sections/logos/block.json";
import { Newsletter as sections_newsletterC } from "./sections/newsletter/react.js";
import sections_newsletterMRaw from "./sections/newsletter/block.json";
import { Pricing as sections_pricingC } from "./sections/pricing/react.js";
import sections_pricingMRaw from "./sections/pricing/block.json";
import { Process as sections_processC } from "./sections/process/react.js";
import sections_processMRaw from "./sections/process/block.json";
import { Stats as sections_statsC } from "./sections/stats/react.js";
import sections_statsMRaw from "./sections/stats/block.json";
import { Team as sections_teamC } from "./sections/team/react.js";
import sections_teamMRaw from "./sections/team/block.json";
import { Testimonials as sections_testimonialsC } from "./sections/testimonials/react.js";
import sections_testimonialsMRaw from "./sections/testimonials/block.json";
import { Timeline as sections_timelineC } from "./sections/timeline/react.js";
import sections_timelineMRaw from "./sections/timeline/block.json";
import { Fingerprint as security_fingerprintC } from "./security/fingerprint/react.js";
import security_fingerprintMRaw from "./security/fingerprint/block.json";
import { Lock as security_lockC } from "./security/lock/react.js";
import security_lockMRaw from "./security/lock/block.json";
import { Shield as security_shieldC } from "./security/shield/react.js";
import security_shieldMRaw from "./security/shield/block.json";
import { Empty as states_emptyC } from "./states/empty/react.js";
import states_emptyMRaw from "./states/empty/block.json";
import { Error as states_errorC } from "./states/error/react.js";
import states_errorMRaw from "./states/error/block.json";
import { Maintenance as states_maintenanceC } from "./states/maintenance/react.js";
import states_maintenanceMRaw from "./states/maintenance/block.json";
import { NotFound as states_notfoundC } from "./states/not-found/react.js";
import states_notfoundMRaw from "./states/not-found/block.json";
import { HealthCheck as status_healthcheckC } from "./status/health-check/react.js";
import status_healthcheckMRaw from "./status/health-check/block.json";
import { ResourceMonitor as status_resourcemonitorC } from "./status/resource-monitor/react.js";
import status_resourcemonitorMRaw from "./status/resource-monitor/block.json";
import { UptimeBar as status_uptimebarC } from "./status/uptime-bar/react.js";
import status_uptimebarMRaw from "./status/uptime-bar/block.json";
import { Checklist as tasks_checklistC } from "./tasks/checklist/react.js";
import tasks_checklistMRaw from "./tasks/checklist/block.json";
import { Kanban as tasks_kanbanC } from "./tasks/kanban/react.js";
import tasks_kanbanMRaw from "./tasks/kanban/block.json";

import type { BlockDefinition } from "./registry.js";

export const blocks: Record<string, BlockDefinition> = {
  "activity/feed": { meta: activity_feedMRaw as never, Component: activity_feedC },
  "activity/timeline": { meta: activity_timelineMRaw as never, Component: activity_timelineC },
  "ai/agent-flow": { meta: ai_agentflowMRaw as never, Component: ai_agentflowC },
  "ai/presence": { meta: ai_presenceMRaw as never, Component: ai_presenceC },
  "ai/prompt-box": { meta: ai_promptboxMRaw as never, Component: ai_promptboxC },
  "ai/retrieval": { meta: ai_retrievalMRaw as never, Component: ai_retrievalC },
  "ai/tools": { meta: ai_toolsMRaw as never, Component: ai_toolsC },
  "ai/voice": { meta: ai_voiceMRaw as never, Component: ai_voiceC },
  "api/logs": { meta: api_logsMRaw as never, Component: api_logsC },
  "api/request": { meta: api_requestMRaw as never, Component: api_requestC },
  "api/webhook": { meta: api_webhookMRaw as never, Component: api_webhookC },
  "avatars/grid": { meta: avatars_gridMRaw as never, Component: avatars_gridC },
  "avatars/stack": { meta: avatars_stackMRaw as never, Component: avatars_stackC },
  "avatars/profile-card": { meta: avatars_profilecardMRaw as never, Component: avatars_profilecardC },
  "branding/spotlight": { meta: branding_spotlightMRaw as never, Component: branding_spotlightC },
  "browser/loading": { meta: browser_loadingMRaw as never, Component: browser_loadingC },
  "browser/simple": { meta: browser_simpleMRaw as never, Component: browser_simpleC },
  "browser/tabs": { meta: browser_tabsMRaw as never, Component: browser_tabsC },
  "calendar/date-picker": { meta: calendar_datepickerMRaw as never, Component: calendar_datepickerC },
  "calendar/event-list": { meta: calendar_eventlistMRaw as never, Component: calendar_eventlistC },
  "calendar/month-view": { meta: calendar_monthviewMRaw as never, Component: calendar_monthviewC },
  "charts/bar": { meta: charts_barMRaw as never, Component: charts_barC },
  "charts/donut": { meta: charts_donutMRaw as never, Component: charts_donutC },
  "charts/funnel": { meta: charts_funnelMRaw as never, Component: charts_funnelC },
  "charts/gauge": { meta: charts_gaugeMRaw as never, Component: charts_gaugeC },
  "charts/heatmap": { meta: charts_heatmapMRaw as never, Component: charts_heatmapC },
  "charts/line": { meta: charts_lineMRaw as never, Component: charts_lineC },
  "charts/sparkline": { meta: charts_sparklineMRaw as never, Component: charts_sparklineC },
  "chat/ai-chat": { meta: chat_aichatMRaw as never, Component: chat_aichatC },
  "chat/bubbles": { meta: chat_bubblesMRaw as never, Component: chat_bubblesC },
  "chat/thread": { meta: chat_threadMRaw as never, Component: chat_threadC },
  "code/editor": { meta: code_editorMRaw as never, Component: code_editorC },
  "code/snippet": { meta: code_snippetMRaw as never, Component: code_snippetC },
  "code/terminal": { meta: code_terminalMRaw as never, Component: code_terminalC },
  "connections/converge": { meta: connections_convergeMRaw as never, Component: connections_convergeC },
  "connections/flow": { meta: connections_flowMRaw as never, Component: connections_flowC },
  "connections/pipeline": { meta: connections_pipelineMRaw as never, Component: connections_pipelineC },
  "connections/sync": { meta: connections_syncMRaw as never, Component: connections_syncC },
  "data/filters": { meta: data_filtersMRaw as never, Component: data_filtersC },
  "data/import": { meta: data_importMRaw as never, Component: data_importC },
  "data/query": { meta: data_queryMRaw as never, Component: data_queryC },
  "data/table": { meta: data_tableMRaw as never, Component: data_tableC },
  "dashboard/mini-panel": { meta: dashboard_minipanelMRaw as never, Component: dashboard_minipanelC },
  "dashboard/widget-grid": { meta: dashboard_widgetgridMRaw as never, Component: dashboard_widgetgridC },
  "devices/laptop": { meta: devices_laptopMRaw as never, Component: devices_laptopC },
  "devices/phone": { meta: devices_phoneMRaw as never, Component: devices_phoneC },
  "devices/tablet": { meta: devices_tabletMRaw as never, Component: devices_tabletC },
  "email/compose": { meta: email_composeMRaw as never, Component: email_composeC },
  "email/inbox": { meta: email_inboxMRaw as never, Component: email_inboxC },
  "files/explorer": { meta: files_explorerMRaw as never, Component: files_explorerC },
  "files/simple": { meta: files_simpleMRaw as never, Component: files_simpleC },
  "files/stacked": { meta: files_stackedMRaw as never, Component: files_stackedC },
  "files/upload": { meta: files_uploadMRaw as never, Component: files_uploadC },
  "geo/globe": { meta: geo_globeMRaw as never, Component: geo_globeC },
  "geo/pin-drop": { meta: geo_pindropMRaw as never, Component: geo_pindropC },
  "geo/world-map": { meta: geo_worldmapMRaw as never, Component: geo_worldmapC },
  "git/branch-graph": { meta: git_branchgraphMRaw as never, Component: git_branchgraphC },
  "git/diff": { meta: git_diffMRaw as never, Component: git_diffC },
  "git/pull-request": { meta: git_pullrequestMRaw as never, Component: git_pullrequestC },
  "images/carousel": { meta: images_carouselMRaw as never, Component: images_carouselC },
  "images/gallery": { meta: images_galleryMRaw as never, Component: images_galleryC },
  "integrations/hub": { meta: integrations_hubMRaw as never, Component: integrations_hubC },
  "integrations/logo-orbit": { meta: integrations_logoorbitMRaw as never, Component: integrations_logoorbitC },
  "integrations/logo-reel": { meta: integrations_logoreelMRaw as never, Component: integrations_logoreelC },
  "keyboard/half": { meta: keyboard_halfMRaw as never, Component: keyboard_halfC },
  "keyboard/shortcut": { meta: keyboard_shortcutMRaw as never, Component: keyboard_shortcutC },
  "media/audio-waveform": { meta: media_audiowaveformMRaw as never, Component: media_audiowaveformC },
  "media/video-player": { meta: media_videoplayerMRaw as never, Component: media_videoplayerC },
  "metrics/comparison": { meta: metrics_comparisonMRaw as never, Component: metrics_comparisonC },
  "metrics/stat-card": { meta: metrics_statcardMRaw as never, Component: metrics_statcardC },
  "metrics/trend": { meta: metrics_trendMRaw as never, Component: metrics_trendC },
  "notifications/bell": { meta: notifications_bellMRaw as never, Component: notifications_bellC },
  "notifications/list": { meta: notifications_listMRaw as never, Component: notifications_listC },
  "notifications/toast": { meta: notifications_toastMRaw as never, Component: notifications_toastC },
  "payments/checkout": { meta: payments_checkoutMRaw as never, Component: payments_checkoutC },
  "payments/credit-card": { meta: payments_creditcardMRaw as never, Component: payments_creditcardC },
  "payments/usage-meter": { meta: payments_usagemeterMRaw as never, Component: payments_usagemeterC },
  "search/command-palette": { meta: search_commandpaletteMRaw as never, Component: search_commandpaletteC },
  "search/results": { meta: search_resultsMRaw as never, Component: search_resultsC },
  "search/semantic": { meta: search_semanticMRaw as never, Component: search_semanticC },
  "sections/auth": { meta: sections_authMRaw as never, Component: sections_authC },
  "sections/backgrounds": { meta: sections_backgroundsMRaw as never, Component: sections_backgroundsC },
  "sections/bento": { meta: sections_bentoMRaw as never, Component: sections_bentoC },
  "sections/blog": { meta: sections_blogMRaw as never, Component: sections_blogC },
  "sections/blog-post": { meta: sections_blogpostMRaw as never, Component: sections_blogpostC },
  "sections/comments": { meta: sections_commentsMRaw as never, Component: sections_commentsC },
  "sections/components": { meta: sections_componentsMRaw as never, Component: sections_componentsC },
  "sections/contact": { meta: sections_contactMRaw as never, Component: sections_contactC },
  "sections/cta": { meta: sections_ctaMRaw as never, Component: sections_ctaC },
  "sections/error": { meta: sections_errorMRaw as never, Component: sections_errorC },
  "sections/faq": { meta: sections_faqMRaw as never, Component: sections_faqC },
  "sections/features": { meta: sections_featuresMRaw as never, Component: sections_featuresC },
  "sections/footers": { meta: sections_footersMRaw as never, Component: sections_footersC },
  "sections/headers": { meta: sections_headersMRaw as never, Component: sections_headersC },
  "sections/hero": { meta: sections_heroMRaw as never, Component: sections_heroC },
  "sections/logos": { meta: sections_logosMRaw as never, Component: sections_logosC },
  "sections/newsletter": { meta: sections_newsletterMRaw as never, Component: sections_newsletterC },
  "sections/pricing": { meta: sections_pricingMRaw as never, Component: sections_pricingC },
  "sections/process": { meta: sections_processMRaw as never, Component: sections_processC },
  "sections/stats": { meta: sections_statsMRaw as never, Component: sections_statsC },
  "sections/team": { meta: sections_teamMRaw as never, Component: sections_teamC },
  "sections/testimonials": { meta: sections_testimonialsMRaw as never, Component: sections_testimonialsC },
  "sections/timeline": { meta: sections_timelineMRaw as never, Component: sections_timelineC },
  "security/fingerprint": { meta: security_fingerprintMRaw as never, Component: security_fingerprintC },
  "security/lock": { meta: security_lockMRaw as never, Component: security_lockC },
  "security/shield": { meta: security_shieldMRaw as never, Component: security_shieldC },
  "states/empty": { meta: states_emptyMRaw as never, Component: states_emptyC },
  "states/error": { meta: states_errorMRaw as never, Component: states_errorC },
  "states/maintenance": { meta: states_maintenanceMRaw as never, Component: states_maintenanceC },
  "states/not-found": { meta: states_notfoundMRaw as never, Component: states_notfoundC },
  "status/health-check": { meta: status_healthcheckMRaw as never, Component: status_healthcheckC },
  "status/resource-monitor": { meta: status_resourcemonitorMRaw as never, Component: status_resourcemonitorC },
  "status/uptime-bar": { meta: status_uptimebarMRaw as never, Component: status_uptimebarC },
  "tasks/checklist": { meta: tasks_checklistMRaw as never, Component: tasks_checklistC },
  "tasks/kanban": { meta: tasks_kanbanMRaw as never, Component: tasks_kanbanC },
};

export function getBlock(key: string): BlockDefinition | undefined {
  return blocks[key];
}

export function blockKeys(): string[] {
  return Object.keys(blocks);
}
